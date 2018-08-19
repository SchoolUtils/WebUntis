import WebUntis from './index.js';
import moment from 'moment';

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

/**
 *
 * @type {WebUntisSecretAuth}
 */
const untisSecret = new WebUntis.WebUntisSecretAuth(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISSECRET, process.env.UNTISHOST);

/**
 *
 * @type {WebUntisQR}
 */
const untisQR = new WebUntis.WebUntisQR(process.env.UNTISQR);


(async function () {
	try {
		await untis.login();
		const x = await untis.validateSession();
		console.log("Valid session: " + x);
		console.log("Timetable: " + JSON.stringify(await untis.getOwnTimetableFor(moment().subtract(2, 'day').toDate())));
		const endOfMonth = moment().endOf('month').toDate();
		console.log("Homework: " + JSON.stringify((await untis.getHomeWorkAndLessons(new Date(), endOfMonth))));
		console.log("Rooms: " + JSON.stringify(await untis.getRooms()))
	} catch (e) {
		console.error(e);
	}
	try {
        await untisSecret.login();
        const x = await untisSecret.validateSession();
        console.log("Valid session: " + x);
        console.log("Timetable: " + JSON.stringify(await untisSecret.getOwnTimetableFor(moment().subtract(2, 'day').toDate())));
        const endOfMonth = moment().endOf('month').toDate();
        console.log("Homework: " + JSON.stringify((await untisSecret.getHomeWorkAndLessons(new Date(), endOfMonth))));
        console.log("Rooms: " + JSON.stringify(await untisSecret.getRooms()))
	} catch (e) {
		console.trace(e);
    }
    try {
        await untisQR.login();
        const x = await untisQR.validateSession();
        console.log("Valid session: " + x);
        console.log("Timetable: " + JSON.stringify(await untisQR.getOwnTimetableFor(moment().subtract(2, 'day').toDate())));
        const endOfMonth = moment().endOf('month').toDate();
        console.log("Homework: " + JSON.stringify((await untisQR.getHomeWorkAndLessons(new Date(), endOfMonth))));
        console.log("Rooms: " + JSON.stringify(await untisQR.getRooms()))
    } catch (e) {
        console.trace(e);
    }

})();