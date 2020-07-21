const { test } = require('zora')
const fs = require('fs')
const path = require('path')
const useTmpDir = require('./')
const { spawn } = require('promisify-child-process')

test('calls the function with a tmpDir path', async t => {
	await useTmpDir(tmpDir => {
		t.ok(/\/tmp\/.+/.test(tmpDir))
	})
})

test('tmpDir is a directory', async t => {
	try {
		await useTmpDir(async tmpDir => {
			const stats = await fs.promises.stat(tmpDir)
			t.ok(stats.isDirectory())
		})
	} catch (error) {
		t.fail(error)
	}
})

test('removes tmpDir after useFn promise resolves', async t => {
	let tmpDir
	await useTmpDir(async _tmpDir => {
		tmpDir = _tmpDir
		return fs.promises.writeFile(path.join(tmpDir, 'foo.txt'), 'foo contents')
	})
	try {
		await fs.promises.access(tmpDir)
		t.fail('tmpDir still exists')
	} catch (error) {
		t.equal(error.code, 'ENOENT', 'tmpDir was removed')
	}
})

test('removes tmpDir after useFn promise rejects', async t => {
	let tmpDir
	try {
		await useTmpDir(async _tmpDir => {
			tmpDir = _tmpDir
			throw new Error('it was a bad time')
		})
	} catch (error) {
		try {
			await fs.promises.access(tmpDir)
			t.fail('tmpDir still exists')
		} catch (error) {
			t.equal(error.code, 'ENOENT', 'tmpDir was removed')
		}
	}
})

test('returns useFn return value', async t => {
	t.equal(
		await useTmpDir(async tmpDir => 'abc123, u n me gurl'),
		'abc123, u n me gurl'
	)
})

test('removes tmpDir if process is killed (useFn promise neither fulfills nor rejects)', async t => {
	const proc = spawn('node', [ '-e', `require('./')(tmpDir => console.log(JSON.stringify({ tmpDir })) || new Promise(resolve => setTimeout(resolve, 100000)))` ], { encoding: 'utf8' })
	await new Promise(resolve => setTimeout(resolve, 500))
	proc.kill('SIGTERM')
	try {
		await proc
	} catch (error) {
		const { signal, stdout, stderr } = error
		const { tmpDir } = JSON.parse(stdout)
		try {
			await fs.promises.access(tmpDir)
			t.fail('tmpDir still exists', tmpDir)
		} catch (error) {
			t.equal(error.code, 'ENOENT', `tmpDir ${tmpDir} was removed`)
		}
	}
})
