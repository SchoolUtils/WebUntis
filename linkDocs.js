const version = require("./package").version;
const path = require("path");
const symlinkDir = require('symlink-dir')
const fs = require("fs-extra");

if (fs.pathExistsSync(path.join(__dirname, "./docs/latest"))) fs.removeSync(path.join(__dirname, "./docs/latest"));
symlinkDir(path.join(__dirname, `./docs/webuntis/${version}/`), path.join(__dirname, "./docs/latest")).then(() => {
    process.exit(0);
}).catch(e => {
    process.exit(1);
})