# @m59/use-tmp-dir

Takes a function and calls it with a path to a temporary directory. The temporary directory is removed after the function completes.

```js
const useTmpDir = require('@m59/use-tmp-dir')

(async () => {
	const result = await useTmpDir(async tmpDir => {
		await someFileSystemWritingThing({ outputDirectoryPath: tmpDir })
		return 123
	})
	result // => 123
})()
```
