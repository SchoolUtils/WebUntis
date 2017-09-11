import WebUntis from './index.mjs';

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

(async function () {
	try {
		await untis.login();
		const x = await untis.validateSession();
		console.log("Valid session: " + x);
		console.log("Timetable: " + JSON.stringify(await untis.getOwnTimetableFor(new Date())))
	} catch (e) {
		console.error(e);
	}

})();