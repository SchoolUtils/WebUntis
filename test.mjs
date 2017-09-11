import WebUntis from './index.mjs';

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

(async function () {
	try {
		const r = await untis.login();
		console.log(r);
		console.log(untis._buildCookies())
		const x = await untis.validateSession();
		console.log(x);
	} catch (e) {
		console.error(e);
	}

})();