const { mkdtemp }  = require('fs').promises
const { tmpdir: osTmpDir } = require('os')
const { sep } = require('path')
const { removeDirectory } = require('@m59/remove-directory')

module.exports = async useFn => {
	const tmpDir = await mkdtemp(`${osTmpDir()}${sep}`)
	try {
		return await useFn(tmpDir)
	} finally {
		await removeDirectory(tmpDir)
	}
}
