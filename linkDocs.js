const version = require("./package").version;
const path = require("path");
const symlinkDir = require('symlink-dir')
const fs = require("fs-extra");

if (fs.pathExistsSync(path.join(__dirname, "./docs/"))) fs.removeSync(path.join(__dirname, "./docs/"));
symlinkDir(path.join(__dirname, `./doc/webuntis/${version}/`), path.join(__dirname, "./docs/")).then(() => {
    process.exit(0);
}).catch(e => {
    process.exit(1);
})