import WebUntis from './index.mjs';
import moment from 'moment';

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

(async function () {
	try {
		await untis.login();
		const x = await untis.validateSession();
		console.log("Valid session: " + x);
		console.log("Timetable: " + JSON.stringify(await untis.getOwnTimetableFor(new Date())))
		const nextFriday = moment().endOf('week').toDate();
		console.log("Homework: " + JSON.stringify((await untis.getHomeWorksFor(new Date(), nextFriday)).data))
	} catch (e) {
		console.error(e);
	}

})();