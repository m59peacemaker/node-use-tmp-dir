const { promises: { mkdtemp, rmdir }, rmdirSync }  = require('fs')
const { tmpdir: osTmpDir } = require('os')
const { sep } = require('path')

const tmpDirs = new Map()

const handleExitSignal = signal => {
	process.off('SIGTERM', handleExitSignal)
	process.off('SIGINT', handleExitSignal)
	for (const [ id, tmpDir ] of tmpDirs) {
		tmpDirs.delete(id)
		rmdirSync(tmpDir, { recursive: true })
	}
	// NOTE: you must do this to forward the signal on, otherwise this listener intercepts the signal and stops the process from exiting
	process.kill(process.pid, signal)
}

process.on('SIGTERM', handleExitSignal)
process.on('SIGINT', handleExitSignal)

module.exports = async useFn => {
	const tmpDir = await mkdtemp(`${osTmpDir()}${sep}`)
	const id = Symbol()
	tmpDirs.set(id, tmpDir)
	try {
		return await useFn(tmpDir)
	} finally {
		tmpDirs.delete(id)
		await rmdir(tmpDir, { recursive: true })
	}
}
