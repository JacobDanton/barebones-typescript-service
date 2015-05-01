// This is a hack to enable using `gulpfile.ts` for our build
// without having to compile it to JavaScript first
require('typescript-require')
require('./gulpfile.ts')
