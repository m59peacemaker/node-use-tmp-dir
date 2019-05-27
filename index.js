const { tmpdir: osTmpDir } = require('os')
const fs = require('fs')
const path = require('path')
const { ulid } = require('ulid')
const removeDirectory = require('@m59/remove-directory')

module.exports = async useFn => {
	const tmpDir = path.join(osTmpDir(), ulid())
	await fs.promises.mkdir(tmpDir)
	try {
		return await useFn(tmpDir)
	} finally {
		await removeDirectory(tmpDir)
	}
}
