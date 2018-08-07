const axios = require('axios');
const CookieBuilder = require('cookie');
const Base64 = require('./Base64');
const moment = require('moment');

/**
 * WebUntis API Class
 */
class WebUntis {

	/**
	 *
	 * @param {String} school
	 * @param {String} username
	 * @param {String} password
	 * @param {String} baseurl
	 * @param {String} identity
	 */
	constructor(school, username, password, baseurl, identity = "Awesome") {
		this.school = school;
		this.schoolbase64 = "_" + Base64.btoa(this.school);
		this.username = username;
		this.password = password;
		this.baseurl = "https://" + baseurl + "/";
		this.cookies = [];
		this.id = identity;
		this.sessionInformation = {};

		this.axios = axios.create({
			baseURL: this.baseurl,
			maxRedirects: 0,
			headers: {
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36",
				"Cache-Control": "no-cache",
				"Pragma": "no-cache",
				"X-Requested-With": "XMLHttpRequest"
			},
			validateStatus: function (status) {
				return status >= 200 && status < 303; // default
			}
		});
	}

	async logout() {
        await this.axios({
            method: "POST",
            url: `/WebUntis/jsonrpc.do?school=${this.school}`,
            data: {
                id: this.id,
                method: "logout",
                params: {},
                jsonrpc: "2.0"
            }
        });
		return true;
	}

	async login() {
		const response = await this.axios({
			method: "POST",
			url: `/WebUntis/jsonrpc.do?school=${this.school}`,
			data: {
				id: this.id,
				method: "authenticate",
				params: {
					user: this.username,
					password: this.password,
					client: this.id
				},
				jsonrpc: "2.0"
			}
		});
		if (typeof response.data !== 'object') throw new Error("Failed to parse server response.");
		if (!response.data.result) throw new Error("Failed to login. " + JSON.stringify(response.data));
		if (response.data.result.code) throw new Error("Login returned error code: " + response.data.result.code);
		if (!response.data.result.sessionId) throw new Error("Failed to login. No session id.");
		this.sessionInformation = response.data.result;
		return response.data.result;
	}

    /**
	 *
     * @returns {Promise<{name: String, id: Number, startDate: Date, endDate: Date}>}
     */
	async getLatestSchoolyear() {
		const data = await this._request('getSchoolyears');
		data.sort((a, b) => {
			const na = moment(a.startDate, 'YYYYMMDD').toDate();
			const nb = moment(b.startDate, 'YYYYMMDD').toDate();
            return nb - na;
		});
		if (!data[0]) throw new Error("Failed to receive school year");
		return {
			name: data[0].name,
			id: data[0].id,
            startDate: moment(data[0].startDate, 'YYYYMMDD').toDate(),
			endDate: moment(data[0].endDate, 'YYYYMMDD').toDate()
		}
	}

	_buildCookies() {
		let cookies = [];
		cookies.push(CookieBuilder.serialize('JSESSIONID', this.sessionInformation.sessionId));
		cookies.push(CookieBuilder.serialize('schoolname', this.schoolbase64));
		return cookies.join('; ');
	}

	async validateSession() {
		const response = await this.axios({
			method: "POST",
			url: `/WebUntis/jsonrpc.do?school=${this.school}`,
			headers: {
				"Cookie": this._buildCookies()
			},
			data: {
				id: this.id,
				method: "getLatestImportTime",
				params: {},
				jsonrpc: "2.0"
			}
		});
		return typeof response.data.result === 'number';
	}
	
	async getLatestImportTime() {
		return this._request("getLatestImportTime")
	}

	async getOwnTimetableForToday() {
		return this._request("getTimetable", {
			"options": {
				"element": {
					"id": this.sessionInformation.personId,
					"type": this.sessionInformation.personType
				},
				"showLsText": true,
				"showStudentgroup": true,
				"showLsNumber": true,
				"showSubstText": true,
				"showInfo": true,
				"showBooking": true,
				"klasseFields": ["id", "name", "longname", "externalkey"],
				"roomFields": ["id", "name", "longname", "externalkey"],
				"subjectFields": ["id", "name", "longname", "externalkey"],
				"teacherFields": ["id", "name", "longname", "externalkey"]
			}
		});
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise.<Object>}
	 */
	async getOwnTimetableFor(date) {
		return this._request("getTimetable", {
			"options": {
				"element": {
					"id": this.sessionInformation.personId,
					"type": this.sessionInformation.personType
				},
				"startDate": this.convertDateToUntis(date),
				"endDate": this.convertDateToUntis(date),
				"showLsText": true,
				"showStudentgroup": true,
				"showLsNumber": true,
				"showSubstText": true,
				"showInfo": true,
				"showBooking": true,
				"klasseFields": ["id", "name", "longname", "externalkey"],
				"roomFields": ["id", "name", "longname", "externalkey"],
				"subjectFields": ["id", "name", "longname", "externalkey"],
				"teacherFields": ["id", "name", "longname", "externalkey"]
			}
		});
	}

	/**
	 *
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @returns {Promise.<Object>}
	 */
	async getOwnTimetableForRange(rangeStart, rangeEnd) {
		return this._request("getTimetable", {
			"options": {
				"element": {
					"id": this.sessionInformation.personId,
					"type": this.sessionInformation.personType
				},
				"startDate": this.convertDateToUntis(rangeStart),
				"endDate": this.convertDateToUntis(rangeEnd),
				"showLsText": true,
				"showStudentgroup": true,
				"showLsNumber": true,
				"showSubstText": true,
				"showInfo": true,
				"showBooking": true,
				"klasseFields": ["id", "name", "longname", "externalkey"],
				"roomFields": ["id", "name", "longname", "externalkey"],
				"subjectFields": ["id", "name", "longname", "externalkey"],
				"teacherFields": ["id", "name", "longname", "externalkey"]
			}
		});
	}

	async getOwnClassTimetableForToday() {
		return this._request("getTimetable", {
			"options": {
				"element": {
					"id": this.sessionInformation.klasseId,
					"type": 1
				},
				"showLsText": true,
				"showStudentgroup": true,
				"showLsNumber": true,
				"showSubstText": true,
				"showInfo": true,
				"showBooking": true,
				"klasseFields": ["id", "name", "longname", "externalkey"],
				"roomFields": ["id", "name", "longname", "externalkey"],
				"subjectFields": ["id", "name", "longname", "externalkey"],
				"teacherFields": ["id", "name", "longname", "externalkey"]
			}
		});
	}

	/**
	 *
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @returns {Promise.<void>}
	 */
	async getHomeWorksFor(rangeStart, rangeEnd) {
		const response = await this.axios({
			method: "GET",
			url: `/WebUntis/api/homeworks/lessons?startDate=${this.convertDateToUntis(rangeStart)}&endDate=${this.convertDateToUntis(rangeEnd)}`,
			headers: {
				"Cookie": this._buildCookies()
			}
		});
		if (typeof response.data.data !== 'object') throw new Error("Server returned invalid data.");
		if (!response.data.data["homeworks"]) throw new Error("Data object doesn't contains homeworks object.");
		return response.data.data;
	}

	/**
	 *
	 * @returns {Promise.<Object>}
	 */
	async getSubjects() {
		return await this._request('getSubjects');
	}

	/**
	 *
	 * @returns {Promise.<Object>}
	 */
	async getTimegrid() {
		return await this._request('getTimegridUnits');
	}

	/**
	 *
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @returns {Promise.<void>}
	 */
	async getHomeWorkAndLessons(rangeStart, rangeEnd) {
		const response = await this.axios({
			method: "GET",
			url: `/WebUntis/api/homeworks/lessons?startDate=${this.convertDateToUntis(rangeStart)}&endDate=${this.convertDateToUntis(rangeEnd)}`,
			headers: {
				"Cookie": this._buildCookies()
			}
		});
		if (typeof response.data.data !== 'object') throw new Error("Server returned invalid data.");
		if (!response.data.data["homeworks"]) throw new Error("Data object doesn't contains homeworks object.");
		return response.data.data;
	}

	/**
	 *
	 * @returns {Promise.<Object>}
	 */
	async getRooms() {
		return await this._request('getRooms');
	}

	/**
	 *
	 * @returns {Promise.<Object>}
	 */
	async getClasses() {
		return await this._request('getKlassen');
	}

	/**
	 *
	 * @returns {Promise.<Object>}
	 */
	async getHolidays() {
		return await this._request('getHolidays');
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {String}
	 */
	convertDateToUntis(date) {
		return date.getFullYear().toString() + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)).toString() + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()).toString();
	}

	/**
	 *
	 * @param {String} method
	 * @param {Object} [parameter={}]
	 * @param {String} [url='/WebUntis/jsonrpc.do?school=SCHOOL']
	 * @returns {Promise.<Object>}
	 * @private
	 */
	async _request(method, parameter = {}, url = `/WebUntis/jsonrpc.do?school=${this.school}`) {
		const response = await this.axios({
			method: "POST",
			url: url,
			headers: {
				"Cookie": this._buildCookies()
			},
			data: {
				id: this.id,
				method: method,
				params: parameter,
				jsonrpc: "2.0"
			}
		});
		if (!response.data.result) throw new Error("Server didn't returned any result.");
		if (response.data.result.code) throw new Error("Server returned error code: " + response.data.result.code);
		return response.data.result;
	}
}

module.exports = WebUntis;
