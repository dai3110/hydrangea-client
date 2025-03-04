const fs = require("fs");
const path = require("path");
const buildPath = path.resolve(__dirname, '../dist');

fs.existsSync(buildPath) && fs.rmSync(buildPath, { recursive: true })
fs.mkdirSync(buildPath)