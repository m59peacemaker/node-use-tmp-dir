const { test } = require('zora')
const fs = require('fs')
const path = require('path')
const useTmpDir = require('./')

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

test('removes tmpDir after use', async t => {
	let tmpDir
	await useTmpDir(async _tmpDir => {
		tmpDir = _tmpDir
		return fs.promises.writeFile(path.join(tmpDir, 'foo.txt'), 'foo contents')
	})
	try {
		await fs.promises.access(tmpDir)
		t.fail('tmpDir still exists')
	} catch (error) {
		t.equal(
			error.code,
			'ENOENT',
			'tmpDir was removed'
		)
	}
})

test('returns useFn return value', async t => {
	t.equal(
		await useTmpDir(async tmpDir => 'abc123, u n me gurl'),
		'abc123, u n me gurl'
	)
})
