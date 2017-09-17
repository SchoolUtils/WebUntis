import WebUntis from './index.js';
import moment from 'moment';

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

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

})();