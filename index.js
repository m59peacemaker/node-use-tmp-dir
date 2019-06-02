const { tmpdir: osTmpDir } = require('os')
const path = require('path')
const { mkdir }  = require('fs')
const { promisify } = require('util')
const mkdirAsync = promisify(mkdir)
const { ulid } = require('ulid')
const removeDirectory = require('@m59/remove-directory')

module.exports = async useFn => {
	const tmpDir = path.join(osTmpDir(), ulid())
	await mkdirAsync(tmpDir)
	try {
		return await useFn(tmpDir)
	} finally {
		await removeDirectory(tmpDir)
	}
}
