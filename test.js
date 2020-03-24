const WebUntis = require('./index');
const { subDays, endOfMonth } = require('date-fns');

require('dotenv').config();

const untis = new WebUntis(
	process.env.SCHOOL,
	process.env.UNTISUSER,
	process.env.UNTISPW,
	process.env.UNTISHOST
);

/**
 *
 * @type {WebUntisSecretAuth}
 */
const untisSecret = new WebUntis.WebUntisSecretAuth(
	process.env.SCHOOL,
	process.env.UNTISUSER,
	process.env.UNTISSECRET,
	process.env.UNTISHOST
);

/**
 *
 * @type {WebUntisQR}
 */
const untisQR = new WebUntis.WebUntisQR(process.env.UNTISQR);

/**
 *
 */
const anonymous = new WebUntis.WebUntisAnonymousAuth(
	process.env.UNTISANONYMOUSSCHOOL,
	process.env.UNTISANONYMOUSSCHOOLHOST
);

(async function() {
	const endOfMonthVar = endOfMonth(new Date());
	const targetDate = subDays(new Date(), 2);
	try {
		await untis.login();
		const x = await untis.validateSession();
		console.log('Valid session (User/PW): ' + x);
		console.log('Session: ' + JSON.stringify(untis.sessionInformation));
		console.log(
			'Timetable: ' +
				JSON.stringify(await untis.getOwnTimetableFor(targetDate))
		);
		console.log(
			'Homework: ' +
				JSON.stringify(
					await untis.getHomeWorkAndLessons(new Date(), endOfMonthVar)
				)
		);
		console.log('Rooms: ' + JSON.stringify(await untis.getRooms()));
		console.log(
			'News: ' + JSON.stringify(await untis.getNewsWidget(targetDate))
		);
	} catch (e) {
		console.error(e);
	}
	try {
		await untisSecret.login();
		const x = await untisSecret.validateSession();
		console.log('Valid session (SECRET): ' + x);
		console.log('Session: ' + JSON.stringify(untisSecret.sessionInformation));
		console.log(
			'Timetable: ' +
				JSON.stringify(await untisSecret.getOwnTimetableFor(targetDate))
		);
		console.log(
			'Homework: ' +
				JSON.stringify(
					await untisSecret.getHomeWorkAndLessons(
						new Date(),
						endOfMonthVar
					)
				)
		);
		console.log('Rooms: ' + JSON.stringify(await untisSecret.getRooms()));
	} catch (e) {
		console.trace(e);
	}
	try {
		await untisQR.login();
		const x = await untisQR.validateSession();
		console.log('Valid session (QR): ' + x);
		console.log('Session: ' + JSON.stringify(untisQR.sessionInformation));
		console.log(
			'Timetable: ' +
				JSON.stringify(await untisQR.getOwnTimetableFor(targetDate))
		);
		console.log(
			'Homework: ' +
				JSON.stringify(
					await untisQR.getHomeWorkAndLessons(
						new Date(),
						endOfMonthVar
					)
				)
		);
		console.log('Rooms: ' + JSON.stringify(await untisQR.getRooms()));
	} catch (e) {
		console.trace(e);
	}
	try {
		await anonymous.login();
		const x = await anonymous.validateSession();
		console.log('Valid session (anonymous): ' + x);
	} catch (e) {
		console.trace(e);
	}
})();
