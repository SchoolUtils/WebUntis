const version = require("./package").version;
const path = require("path");
const symlinkDir = require('symlink-dir')
const fs = require("fs-extra");

if (fs.pathExistsSync(path.join(__dirname, "./docs/latest"))) fs.removeSync(path.join(__dirname, "./docs/latest"));

fs.ensureDirSync(path.join(__dirname, "./docs/latest"));
fs.ensureFileSync(path.join(__dirname, "./docs/latest/index.html"));
fs.outputFileSync(path.join(__dirname, "./docs/latest/index.html"), `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirect</title>
    <meta http-equiv="refresh" content="URL=https://noim.me/WebUntis/webuntis/${version}/">
</head>
<body>

</body>
</html>`);