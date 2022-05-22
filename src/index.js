import { mkdtemp } from 'node:fs/promises'
import { tmpdir as os_tmp_dir } from 'node:os'
import { sep } from 'node:path'
import { use_path } from './use_path.js'

export const prefix = os_tmp_dir() + sep

export const use_tmp_dir = async f => use_path(await mkdtemp(prefix), f)
