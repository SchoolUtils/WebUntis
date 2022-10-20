# WebUntis API

This is a NodeJS Wrapper for the JSON RPC WebUntis API.

The Documentation is available at [https://webuntis.noim.me/](https://webuntis.noim.me/)

In case you need the Untis API Spec (pdf), you need to email Untis directly and ask. I am (legally) not allowed to publish it.

## Note:

As I have not been a student for a long time, I currently have no access to any Untis services. If you want to share your login details with me for testing purposes, contact me via [Telegram](t.me/TheNoim) or other means ([Homepage](noim.io)).

## Examples

### User/Password Login

```javascript
import { WebUntis } from 'webuntis';

const untis = new WebUntis('school', 'username', 'password', 'xyz.webuntis.com');

await untis.login();
const timetable = await untis.getOwnTimetableForToday();

// profit
```

### QR Code Login

```javascript
import { WebUntisQR } from 'webuntis';
import { URL } from 'url';
import { authenticator as Authenticator } from 'otplib';

// The result of the scanned QR Code
const QRCodeData = 'untis://setschool?url=[...]&school=[...]&user=[...]&key=[...]&schoolNumber=[...]';

const untis = new WebUntisQR(QRCodeData, 'custom-identity', Authenticator, URL);

await untis.login();
const timetable = await untis.getOwnTimetableForToday();

// profit
```

### User/Secret Login

```javascript
import { WebUntisSecretAuth } from 'webuntis';
import { authenticator as Authenticator } from 'otplib';

const secret = 'NL04FGY4FSY5';

const untis = new WebUntisSecretAuth('school', 'username', secret, 'xyz.webuntis.com', 'custom-identity', Authenticator);

await untis.login();
const timetable = await untis.getOwnTimetableForToday();

// profit
```

### Anonymous Login

Only if your school supports public access.

```javascript
import { WebUntisAnonymousAuth, WebUntisElementType } from 'webuntis';

const untis = new WebUntisAnonymousAuth('school', 'xyz.webuntis.com');

await untis.login();
const classes = await units.getClasses();
const timetable = await units.getTimetableForToday(classes[0].id, WebUntisElementType.CLASS);

// profit
```

### Installation

This package is compatible with CJS and ESM. *Note:* This package primary target is nodejs. It may also work with runtimes like react-native, but it will probably not work in the browser.

```bash
yarn add webuntis
# Or
npm i webuntis --save
# Or
pnpm i webuntis
```

### ESM note:

If you use the esm version of this package, you need to provide `Authenticator` and `URL` if necessary. For more information, look at the `User/Secret Login` or `QR Code Login` example. This is not needed for `username/password` or `anonymous` login. 

### Notice

I am not affiliated with Untis GmbH. Use this at your own risk.
