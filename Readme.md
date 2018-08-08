# WebUntis API

This is a NodeJS Wrapper for the JSON RPC WebUntis API.

The Documentation is available at [https://noim.me/WebUntis/](https://noim.me/WebUntis/)

### Example

```javascript
const WebUntis = require("webuntis");

const untis = new WebUntis("school", "username", "password", "xyz.webuntis.com");

untis.login().then(() => {
	return untis.getOwnTimetableForToday();
}).then(timetable => {
	// profit
});
```