const { WebUntis, WebUntisSecretAuth, WebUntisQR, WebUntisAnonymousAuth } = require('./dist/webuntis');
const { subDays, endOfMonth } = require('date-fns');

require('dotenv').config();

const untis = new WebUntis(process.env.SCHOOL, process.env.UNTISUSER, process.env.UNTISPW, process.env.UNTISHOST);

console.log(process.env.UNTISPW);

/**
 *
 * @type {WebUntisSecretAuth}
 */
const untisSecret = new WebUntisSecretAuth(
    process.env.SCHOOL,
    process.env.UNTISUSER,
    process.env.UNTISSECRET,
    process.env.UNTISHOST
);

/**
 *
 * @type {WebUntisQR}
 */
const untisQR = new WebUntisQR(process.env.UNTISQR);

/**
 *
 */
const anonymous = new WebUntisAnonymousAuth(process.env.UNTISANONYMOUSSCHOOL, process.env.UNTISANONYMOUSSCHOOLHOST);

(async function () {
    const endOfMonthVar = endOfMonth(new Date());
    const targetDate = subDays(new Date(), 2);
    console.log('Normal login:');
    try {
        await untis.login();
        const x = await untis.validateSession();
        console.log('Valid session (User/PW): ' + x);
        // console.log(
        //     'Absent Lessons: ' + JSON.stringify(await untis.getAbsentLesson(new Date('20210913'), new Date(), true))
        // );
        // console.log(await untis.getPdfOfAbsentLesson(new Date(Date.now() - 7 * 24 * 60 * 60), new Date(), true));
        console.log('Session: ' + JSON.stringify(untis.sessionInformation));
        console.log('Timetable: ' + JSON.stringify(await untis.getOwnTimetableFor(targetDate)));
        // console.log('Homework: ' + JSON.stringify(await untis.getHomeWorkAndLessons(new Date(), endOfMonthVar)));
        console.log('Rooms: ' + JSON.stringify(await untis.getRooms()));
        console.log('News: ' + JSON.stringify(await untis.getNewsWidget(targetDate)));
    } catch (e) {
        console.error(e);
    }
    console.log('Secret login:');
    try {
        await untisSecret.login();
        const x = await untisSecret.validateSession();
        console.log('Valid session (SECRET): ' + x);
        console.log('Session: ' + JSON.stringify(untisSecret.sessionInformation));
        console.log('Timetable: ' + JSON.stringify(await untisSecret.getOwnTimetableFor(targetDate)));
        console.log('Homework: ' + JSON.stringify(await untisSecret.getHomeWorkAndLessons(new Date(), endOfMonthVar)));
        console.log('Rooms: ' + JSON.stringify(await untisSecret.getRooms()));
    } catch (e) {
        console.trace(e);
    }
    console.log('QR Login:');
    try {
        await untisQR.login();
        const x = await untisQR.validateSession();
        console.log('Valid session (QR): ' + x);
        console.log('Session: ' + JSON.stringify(untisQR.sessionInformation));
        console.log('Timetable: ' + JSON.stringify(await untisQR.getOwnTimetableFor(targetDate)));
        console.log('Homework: ' + JSON.stringify(await untisQR.getHomeWorkAndLessons(new Date(), endOfMonthVar)));
        console.log('Rooms: ' + JSON.stringify(await untisQR.getRooms()));
    } catch (e) {
        console.trace(e);
    }
    console.log('Anonymous:');
    try {
        await anonymous.login();
        const x = await anonymous.validateSession();
        console.log('Valid session (anonymous): ' + x);
    } catch (e) {
        console.trace(e);
    }
})();
