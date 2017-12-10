// this file generate the index.ts in collection/,
// which is imported by webpack.base.conf.js,
// and run before any loader.

const gulp = require('gulp')

const fs = require('fs')
const path = require('path')

const genIndexTs = () => {
  console.log('-----------------------------------')
  debugger
  let files = fs.readdirSync(path.join(__dirname, '..', 'src', 'collection'))
  const code = ['export {']
  files.forEach(file => {
    if (file === 'index.ts') return
    if (!file.match(/\.ts$/)) return
    let fn = file.replace(/\.ts$/, '')
    // code.push(`export const ${fn} = require('${fn}')`)
    code.unshift(`import {${fn}} from './${fn}'`)
    code.push(fn+',')
  })
  code.push('}')
  src = code.join('\n')
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'collection', 'index.ts'), src, 'utf-8')
}

// gulp.task('watch', () => {
//   gulp.watch('../src/collection/*.ts', null, () => {
//     genIndexTs()
//   })
// })

genIndexTs()