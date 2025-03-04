const fs = require('fs')
const path = require('path')

fs.copyFileSync(
  path.resolve(__dirname, '../lambda/index.js'),
  path.resolve(__dirname, '../.output/index.js')
)
