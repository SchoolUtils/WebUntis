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

(async function() {
	const endOfMonthVar = endOfMonth(new Date());
	const targetDate = subDays(new Date(), 2);
	try {
		await untis.login();
		const x = await untis.validateSession();
		console.log('Valid session: ' + x);
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
	} catch (e) {
		console.error(e);
	}
	try {
		await untisSecret.login();
		const x = await untisSecret.validateSession();
		console.log('Valid session: ' + x);
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
		console.log('Valid session: ' + x);
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
})();
