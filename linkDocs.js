const version = require("./package").version;
const path = require("path");
const symlinkDir = require('symlink-dir')
const fs = require("fs-extra");

if (fs.pathExistsSync(path.join(__dirname, "./docs/"))) fs.removeSync(path.join(__dirname, "./docs/"));

fs.moveSync(`./doc/webuntis/${version}/`, "./docs/", {overwrite: true});
fs.removeSync(path.join(__dirname, "./doc/"));