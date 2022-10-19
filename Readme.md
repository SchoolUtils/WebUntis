# Base API

This is a NodeJS Wrapper for the JSON RPC Base API.

The Documentation is available at [https://webuntis.noim.me/](https://webuntis.noim.me/)

In case you need the Untis API Spec (pdf) where those JSON responses are explained, you need to directly email Untis and ask. I am (legally) not allowed to publish it.

## Examples

### User/Password Login

```javascript
const Base = require('webuntis');

const untis = new Base('school', 'username', 'password', 'xyz.webuntis.com');

untis
    .login()
    .then(() => {
        return untis.getOwnTimetableForToday();
    })
    .then((timetable) => {
        // profit
    });
```

### QR Code Login

```javascript
const WebUntisLib = require('webuntis');

// The result of the scanned QR Code
const QRCodeData = 'untis://setschool?url=[...]&school=[...]&user=[...]&key=[...]&schoolNumber=[...]';

const untis = new WebUntisLib.WebUntisQR(QRCodeData);

untis
    .login()
    .then(() => {
        return untis.getOwnTimetableForToday();
    })
    .then((timetable) => {
        // profit
    });
```

### User/Secret Login

```javascript
const WebUntisLib = require('webuntis');

const secret = 'NL04FGY4FSY5';

const untis = new WebUntisLib.WebUntisSecretAuth('school', 'username', secret, 'xyz.webuntis.com');

untis
    .login()
    .then(() => {
        return untis.getOwnTimetableForToday();
    })
    .then((timetable) => {
        // profit
    });
```

### Anonymous Login

Only if your school supports public access.

```javascript
const WebUntisLib = require('webuntis');

const untis = new WebUntisLib.WebUntisAnonymousAuth('school', 'xyz.webuntis.com');

untis
    .login()
    .then(() => {
        return untis.getClasses();
    })
    .then((classes) => {
        // Get timetable for the first class
        return untis.getTimetableForToday(classes[0].id, WebUntisLib.TYPES.CLASS);
    })
    .then((timetable) => {
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
