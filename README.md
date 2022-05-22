# @m59/use-tmp-dir

Takes a function and calls it with a path to a temporary directory. The temporary directory is removed after the function completes, or if the process exits meanwhile.

```node
import { use_tmp_dir } from '@m59/use-tmp-dir'
```

<!--js
import { use_tmp_dir } from './src/index.js'
-->

```js
import { access, writeFile } from 'node:fs/promises'
import { join as join_path } from 'node:path'

const removed_tmp_dir = await use_tmp_dir(
	async tmp_dir => {
		await writeFile(join_path(tmp_dir, 'some-file.txt'), 'some contents')
		return tmp_dir
	}
)

const error = await access(removed_tmp_dir)
	.catch(error => error)
error.code // => 'ENOENT'
```
