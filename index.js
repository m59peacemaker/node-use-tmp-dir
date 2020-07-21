const { mkdtemp, rmdir }  = require('fs').promises
const { tmpdir: osTmpDir } = require('os')
const { sep } = require('path')

module.exports = async useFn => {
	const tmpDir = await mkdtemp(`${osTmpDir()}${sep}`)
	try {
		return await useFn(tmpDir)
	} finally {
		await rmdir(tmpDir, { recursive: true })
	}
}
