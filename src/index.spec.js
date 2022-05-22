import { test } from 'zora'
import fs from 'node:fs'
import path from 'node:path'
import { tmpdir as os_tmp_dir } from 'node:os'
import { use_tmp_dir } from './index.js'
import { spawn } from 'promisify-child-process'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

test('calls the function with a tmp_dir path', async t => {
	await use_tmp_dir(tmp_dir => {
		t.ok(tmp_dir.startsWith(os_tmp_dir))
	})
})

test('tmp_dir is a directory', async t => {
	try {
		await use_tmp_dir(async tmp_dir => {
			const stats = await fs.promises.stat(tmp_dir)
			t.ok(stats.isDirectory())
		})
	} catch (error) {
		t.fail(error)
	}
})

test('removes tmp_dir after use fn promise resolves', async t => {
	let tmp_dir
	await use_tmp_dir(async _tmp_dir => {
		tmp_dir = _tmp_dir
		return fs.promises.writeFile(path.join(tmp_dir, 'foo.txt'), 'foo contents')
	})
	try {
		await fs.promises.access(tmp_dir)
		t.fail('tmp_dir still exists')
	} catch (error) {
		t.equal(error.code, 'ENOENT', 'tmp_dir was removed')
	}
})

test('removes tmp_dir after use fn promise rejects', async t => {
	let tmp_dir
	try {
		await use_tmp_dir(async _tmp_dir => {
			tmp_dir = _tmp_dir
			throw new Error('it was a bad time')
		})
	} catch (error) {
		try {
			await fs.promises.access(tmp_dir)
			t.fail('tmp_dir still exists')
		} catch (error) {
			t.equal(error.code, 'ENOENT', 'tmp_dir was removed')
		}
	}
})

test('returns use fn return value', async t => {
	t.equal(
		await use_tmp_dir(async tmp_dir => 'abc123, u n me gurl'),
		'abc123, u n me gurl'
	)
})

test('removes tmp_dir if process is killed (when use fn promise has neither fulfilled nor rejected)', async t => {
	const code = `
		import { use_tmp_dir } from './index.js'

		use_tmp_dir(tmp_dir =>
			console.log(JSON.stringify({ tmp_dir })) || new Promise(resolve => setTimeout(resolve, 100000))
		)
	`
	const proc = spawn('node', [ '-e', code, '--input-type', 'module' ], { encoding: 'utf8', cwd: __dirname })
	await new Promise(resolve => setTimeout(resolve, 500))
	proc.kill('SIGTERM')
	try {
		await proc
	} catch (error) {
		const { signal, stdout, stderr } = error
		const { tmp_dir } = JSON.parse(stdout)
		try {
			await fs.promises.access(tmp_dir)
			t.fail(`tmp_dir still exists: ${tmp_dir}`)
		} catch (error) {
			t.equal(error.code, 'ENOENT', `tmp_dir ${tmp_dir} was removed`)
		}
	}
})
