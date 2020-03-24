# WebUntis API

This is a NodeJS Wrapper for the JSON RPC WebUntis API.

The Documentation is available at [https://noim.me/WebUntis/](https://noim.me/WebUntis/)

In case you need the Untis API Spec (pdf) where those JSON responses are explained, you need to directly email Untis and ask. I am (legally) not allowed to publish it.

## Examples

### User/Password Login

```javascript
const WebUntis = require('webuntis');

const untis = new WebUntis(
	'school',
	'username',
	'password',
	'xyz.webuntis.com'
);

untis
	.login()
	.then(() => {
		return untis.getOwnTimetableForToday();
	})
	.then(timetable => {
		// profit
	});
```

### QR Code Login

```javascript
const WebUntisLib = require('webuntis');

// The result of the scanned QR Code
const QRCodeData =
	'untis://setschool?url=[...]&school=[...]&user=[...]&key=[...]&schoolNumber=[...]';

const untis = new WebUntisLib.WebUntisQR(QRCodeData);

untis
	.login()
	.then(() => {
		return untis.getOwnTimetableForToday();
	})
	.then(timetable => {
		// profit
	});
```

### User/Secret Login

```javascript
const WebUntisLib = require('webuntis');

const secret = 'NL04FGY4FSY5';

const untis = new WebUntisLib.WebUntisSecretAuth(
	'school',
	'username',
	secret,
	'xyz.webuntis.com'
);

untis
	.login()
	.then(() => {
		return untis.getOwnTimetableForToday();
	})
	.then(timetable => {
		// profit
	});
```

### Anonymous Login

Only if your school supports public access.

```javascript
const WebUntisLib = require('webuntis');

const untis = new WebUntisLib.WebUntisAnonymousAuth(
	'school',
	'xyz.webuntis.com'
);

untis
	.login()
	.then(() => {
	    return untis.getClasses();
	})
    .then(classes => {
        // Get timetable for the first class
        return untis.getTimetableForToday(classes[0].id, WebUntisLib.TYPES.CLASS);
    })
	.then(timetable => {
		// profit
	});
```

### Installation

```bash
yarn add webuntis
# Or
npm i webuntis --save
```

### Notice

I am not affiliated with Untis GmbH. Use this at your own risk.

### License

Copyright 2019 Nils Bergmann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
