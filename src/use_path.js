import { rmSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { create_disposer } from '@m59/disposer'

export const use_path = create_disposer({
	dispose: path => rm(path, { recursive: true }),
	dispose_on_exit: path => rmSync(path, { recursive: true })
})
