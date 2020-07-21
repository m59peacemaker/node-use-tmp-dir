const { promises: { mkdtemp, rmdir }, rmdirSync }  = require('fs')
const { tmpdir: osTmpDir } = require('os')
const { sep } = require('path')

module.exports = async useFn => {
	const tmpDir = await mkdtemp(`${osTmpDir()}${sep}`)

	const handleExitSignal = signal => {
		stopListening()
		rmdirSync(tmpDir, { recursive: true })
		process.kill(process.pid, signal)
	}
	const stopListening = () => {
		process.off('SIGTERM', handleExitSignal)
		process.off('SIGINT', handleExitSignal)
	}
	process.on('SIGTERM', handleExitSignal)
	process.on('SIGINT', handleExitSignal)

	try {
		return await useFn(tmpDir)
	} finally {
		stopListening()
		await rmdir(tmpDir, { recursive: true })
	}
}
