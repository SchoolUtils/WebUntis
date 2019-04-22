const axios = require('axios');
const CookieBuilder = require('cookie');
const Base64 = require('./Base64');
const otp = require('otplib/authenticator');
const find = require('lodash.find');
const { URL } = require('url');
const { parse } = require('date-fns');

otp.options = { crypto: require('crypto') };

/**
 * WebUntis API Class
 */
class WebUntis {
	/**
	 *
	 * @constructor
	 * @param {string} school The school identifier
	 * @param {string} username
	 * @param {string} password
	 * @param {string} baseurl Just the host name of your WebUntis (Example: mese.webuntis.com)
	 * @param {string} [identity="Awesome"] A identity like: MyAwesomeApp
	 */
	constructor(school, username, password, baseurl, identity = 'Awesome') {
		this.school = school;
		this.schoolbase64 = '_' + Base64.btoa(this.school);
		this.username = username;
		this.password = password;
		this.baseurl = 'https://' + baseurl + '/';
		this.cookies = [];
		this.id = identity;
		this.sessionInformation = {};

		this.axios = axios.create({
			baseURL: this.baseurl,
			maxRedirects: 0,
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36',
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache',
				'X-Requested-With': 'XMLHttpRequest'
			},
			validateStatus: function(status) {
				return status >= 200 && status < 303; // default
			}
		});
	}

	/**
	 * Logout the current session
	 * @returns {Promise<boolean>}
	 */
	async logout() {
		await this.axios({
			method: 'POST',
			url: `/WebUntis/jsonrpc.do?school=${this.school}`,
			data: {
				id: this.id,
				method: 'logout',
				params: {},
				jsonrpc: '2.0'
			}
		});
		this.sessionInformation = null;
		return true;
	}

	/**
	 * Login with your credentials
	 * @returns {Promise<Object>}
	 */
	async login() {
		const response = await this.axios({
			method: 'POST',
			url: `/WebUntis/jsonrpc.do?school=${this.school}`,
			data: {
				id: this.id,
				method: 'authenticate',
				params: {
					user: this.username,
					password: this.password,
					client: this.id
				},
				jsonrpc: '2.0'
			}
		});
		if (typeof response.data !== 'object')
			throw new Error('Failed to parse server response.');
		if (!response.data.result)
			throw new Error(
				'Failed to login. ' + JSON.stringify(response.data)
			);
		if (response.data.result.code)
			throw new Error(
				'Login returned error code: ' + response.data.result.code
			);
		if (!response.data.result.sessionId)
			throw new Error('Failed to login. No session id.');
		this.sessionInformation = response.data.result;
		return response.data.result;
	}

	/**
	 * Get the latest WebUntis Schoolyear
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise<{name: String, id: Number, startDate: Date, endDate: Date}>}
	 */
	async getLatestSchoolyear(validateSession = true) {
		const data = await this._request('getSchoolyears', {}, validateSession);
		data.sort((a, b) => {
			const na = parse(a.startDate, 'yyyyMMdd', new Date());
			const nb = parse(b.startDate, 'yyyyMMdd', new Date());
			return nb - na;
		});
		if (!data[0]) throw new Error('Failed to receive school year');
		return {
			name: data[0].name,
			id: data[0].id,
			startDate: parse(data[0].startDate, 'yyyyMMdd', new Date()),
			endDate: parse(data[0].endDate, 'yyyyMMdd', new Date())
		};
	}

	/**
	 *
	 * @returns {string}
	 * @private
	 */
	_buildCookies() {
		let cookies = [];
		cookies.push(
			CookieBuilder.serialize(
				'JSESSIONID',
				this.sessionInformation.sessionId
			)
		);
		cookies.push(CookieBuilder.serialize('schoolname', this.schoolbase64));
		return cookies.join('; ');
	}

	/**
	 * Checks if your current WebUntis Session is valid
	 * @returns {Promise<boolean>}
	 */
	async validateSession() {
		const response = await this.axios({
			method: 'POST',
			url: `/WebUntis/jsonrpc.do?school=${this.school}`,
			headers: {
				Cookie: this._buildCookies()
			},
			data: {
				id: this.id,
				method: 'getLatestImportTime',
				params: {},
				jsonrpc: '2.0'
			}
		});
		return typeof response.data.result === 'number';
	}

	/**
	 * Get the time when WebUntis last changed it's data
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise<Number>}
	 */
	async getLatestImportTime(validateSession = true) {
		return this._request('getLatestImportTime', {}, validateSession);
	}

	/**
	 * Get your own Timetable for the current day
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise<Array>}
	 */
	async getOwnTimetableForToday(validateSession = true) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.personId,
						type: this.sessionInformation.personType
					},
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 * Get your own Timetable for the given day
	 * @param {Date} date
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getOwnTimetableFor(date, validateSession = true) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.personId,
						type: this.sessionInformation.personType
					},
					startDate: this.convertDateToUntis(date),
					endDate: this.convertDateToUntis(date),
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 * Get your own timetable for a given Date range
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getOwnTimetableForRange(
		rangeStart,
		rangeEnd,
		validateSession = true
	) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.personId,
						type: this.sessionInformation.personType
					},
					startDate: this.convertDateToUntis(rangeStart),
					endDate: this.convertDateToUntis(rangeEnd),
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 * Get the Timetable of your class for today
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise<Array>}
	 */
	async getOwnClassTimetableForToday(validateSession = true) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.klasseId,
						type: 1
					},
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 * Get the Timetable of your class for the given day
	 * @param {Date} date
	 * @param {Boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getOwnClassTimetableFor(date, validateSession = true) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.klasseId,
						type: 1
					},
					startDate: this.convertDateToUntis(date),
					endDate: this.convertDateToUntis(date),
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 * Get the Timetable of your class for a given Date range
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getOwnClassTimetableForRange(
		rangeStart,
		rangeEnd,
		validateSession = true
	) {
		return this._request(
			'getTimetable',
			{
				options: {
					element: {
						id: this.sessionInformation.klasseId,
						type: 1
					},
					startDate: this.convertDateToUntis(rangeStart),
					endDate: this.convertDateToUntis(rangeEnd),
					showLsText: true,
					showStudentgroup: true,
					showLsNumber: true,
					showSubstText: true,
					showInfo: true,
					showBooking: true,
					klasseFields: ['id', 'name', 'longname', 'externalkey'],
					roomFields: ['id', 'name', 'longname', 'externalkey'],
					subjectFields: ['id', 'name', 'longname', 'externalkey'],
					teacherFields: ['id', 'name', 'longname', 'externalkey']
				}
			},
			validateSession
		);
	}

	/**
	 *
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getHomeWorksFor(rangeStart, rangeEnd, validateSession = true) {
		if (validateSession && !(await this.validateSession()))
			throw new Error('Current Session is not valid');
		const response = await this.axios({
			method: 'GET',
			url: `/WebUntis/api/homeworks/lessons?startDate=${this.convertDateToUntis(
				rangeStart
			)}&endDate=${this.convertDateToUntis(rangeEnd)}`,
			headers: {
				Cookie: this._buildCookies()
			}
		});
		if (typeof response.data.data !== 'object')
			throw new Error('Server returned invalid data.');
		if (!response.data.data['homeworks'])
			throw new Error("Data object doesn't contains homeworks object.");
		return response.data.data;
	}

	/**
	 * Get all known Subjects for the current logged in user
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getSubjects(validateSession = true) {
		return await this._request('getSubjects', {}, validateSession);
	}

	/**
	 * Get the timegrid of current school
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getTimegrid(validateSession = true) {
		return await this._request('getTimegridUnits', {}, validateSession);
	}

	/**
	 *
	 * @param {Date} rangeStart
	 * @param {Date} rangeEnd
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<void>}
	 */
	async getHomeWorkAndLessons(rangeStart, rangeEnd, validateSession = true) {
		if (validateSession && !(await this.validateSession()))
			throw new Error('Current Session is not valid');
		const response = await this.axios({
			method: 'GET',
			url: `/WebUntis/api/homeworks/lessons?startDate=${this.convertDateToUntis(
				rangeStart
			)}&endDate=${this.convertDateToUntis(rangeEnd)}`,
			headers: {
				Cookie: this._buildCookies()
			}
		});
		if (typeof response.data.data !== 'object')
			throw new Error('Server returned invalid data.');
		if (!response.data.data['homeworks'])
			throw new Error("Data object doesn't contains homeworks object.");
		return response.data.data;
	}

	/**
	 * Get all known rooms by WebUntis
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getRooms(validateSession = true) {
		return await this._request('getRooms', {}, validateSession);
	}

	/**
	 * Get all classes known by WebUntis
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getClasses(validateSession = true) {
		return await this._request('getKlassen', {}, validateSession);
	}

	/**
	 * Get all Holidays known by WebUntis
	 * @param {boolean} [validateSession=true]
	 * @returns {Promise.<Array>}
	 */
	async getHolidays(validateSession = true) {
		return await this._request('getHolidays', {}, validateSession);
	}

	/**
	 * Convert a JS Date Object to a WebUntis date string
	 * @param {Date} date
	 * @returns {String}
	 */
	convertDateToUntis(date) {
		return (
			date.getFullYear().toString() +
			(date.getMonth() + 1 < 10
				? '0' + (date.getMonth() + 1)
				: date.getMonth() + 1
			).toString() +
			(date.getDate() < 10
				? '0' + date.getDate()
				: date.getDate()
			).toString()
		);
	}

	/**
	 * Make a JSON RPC Request with the current session
	 * @param {string} method
	 * @param {Object} [parameter={}]
	 * @param {string} [url='/WebUntis/jsonrpc.do?school=SCHOOL']
	 * @param {boolean} [validateSession=true] Whether the session should be checked first
	 * @returns {Promise.<any>}
	 * @private
	 */
	async _request(
		method,
		parameter = {},
		validateSession = true,
		url = `/WebUntis/jsonrpc.do?school=${this.school}`
	) {
		if (validateSession && !(await this.validateSession()))
			throw new Error('Current Session is not valid');
		const response = await this.axios({
			method: 'POST',
			url: url,
			headers: {
				Cookie: this._buildCookies()
			},
			data: {
				id: this.id,
				method: method,
				params: parameter,
				jsonrpc: '2.0'
			}
		});
		if (!response.data.result)
			throw new Error("Server didn't returned any result.");
		if (response.data.result.code)
			throw new Error(
				'Server returned error code: ' + response.data.result.code
			);
		return response.data.result;
	}
}

class WebUntisSecretAuth extends WebUntis {
	/**
	 *
	 * @constructor
	 * @augments WebUntis
	 * @param {string} school The school identifier
	 * @param {string} user
	 * @param {string} secret
	 * @param {string} baseurl Just the host name of your WebUntis (Example: mese.webuntis.com)
	 * @param {string} [identity="Awesome"] A identity like: MyAwesomeApp
	 */
	constructor(school, user, secret, baseurl, identity = 'Awesome') {
		super(school, user, null, baseurl, identity);
		this.secret = secret;
	}

	async login() {
		// Get JSESSION
		const url = `/WebUntis/jsonrpc_intern.do?m=isPremiumAvailable&school=${
			this.school
		}&v=i2.2`;
		const token = otp.generate(this.secret);
		const time = new Date().getTime();
		const response = await this.axios({
			method: 'POST',
			url,
			data: {
				id: this.id,
				method: 'isPremiumAvailable',
				params: [
					{
						auth: {
							clientTime: time,
							user: this.username,
							otp: token
						}
					}
				],
				jsonrpc: '2.0'
			}
		});
		if (response.data && response.data.error)
			throw new Error(
				'Failed to login. ' + (response.data.error.message || '')
			);
		if (
			response.headers &&
			response.headers['set-cookie'] &&
			this._getCookieFromSetCookie(response.headers['set-cookie']) ===
				false
		)
			throw new Error(
				"Failed to login. Server didn't return a session id."
			);
		const sessionId = this._getCookieFromSetCookie(
			response.headers['set-cookie']
		);
		// Set session temporary
		this.sessionInformation = {
			sessionId: sessionId
		};
		// Get personId & personType
		const appConfigUrl = `/WebUntis/api/app/config`;
		const configResponse = await this.axios({
			method: 'GET',
			url: appConfigUrl,
			headers: {
				Cookie: this._buildCookies()
			}
		});
		if (
			typeof configResponse.data !== 'object' ||
			typeof configResponse.data.data !== 'object'
		)
			throw new Error(
				'Failed to fetch app config while login. data (type): ' +
					typeof response.data
			);
		// Path -> data.loginServiceConfig.user.persons -> find person with id
		if (
			configResponse.data.data &&
			configResponse.data.data.loginServiceConfig &&
			configResponse.data.data.loginServiceConfig.user &&
			!Number.isInteger(
				configResponse.data.data.loginServiceConfig.user.personId
			)
		)
			throw new Error(
				'Invalid personId. personId: ' +
					configResponse.data.data.loginServiceConfig.user.personId
			);
		const webUntisLoginServiceUser =
			configResponse.data.data.loginServiceConfig.user;
		if (!Array.isArray(webUntisLoginServiceUser.persons))
			throw new Error(
				'Invalid person array. persons (type): ' +
					typeof webUntisLoginServiceUser.persons
			);
		const person = find(webUntisLoginServiceUser.persons, {
			id: configResponse.data.data.loginServiceConfig.user.personId
		});
		if (!person) throw new Error('Can not find person in person array.');
		if (!Number.isInteger(person.type))
			throw new Error('Invalid person type. type (type): ' + person.type);
		this.sessionInformation = {
			sessionId: sessionId,
			personType: person.type,
			personId: configResponse.data.data.loginServiceConfig.user.personId
		};
		// Get klasseId
		try {
			const dayConfigUrl = `/WebUntis/api/daytimetable/config`;
			const dayConfigResponse = await this.axios({
				method: 'GET',
				url: dayConfigUrl,
				headers: {
					Cookie: this._buildCookies()
				}
			});
			if (
				typeof dayConfigResponse.data !== 'object' ||
				typeof dayConfigResponse.data.data !== 'object'
			)
				throw new Error();
			if (!Number.isInteger(dayConfigResponse.data.data.klasseId))
				throw new Error();
			this.sessionInformation = {
				sessionId: sessionId,
				personType: person.type,
				personId:
					configResponse.data.data.loginServiceConfig.user.personId,
				klasseId: dayConfigResponse.data.data.klasseId
			};
		} catch (e) {
			// klasseId is not important. This request can fail
		}
		return true;
	}

	/**
	 *
	 * @param {Array} setCookieArray
	 * @param {string} [cookieName="JSESSIONID"]
	 * @return {string|boolean}
	 * @private
	 */
	_getCookieFromSetCookie(setCookieArray, cookieName = 'JSESSIONID') {
		for (const setCookie of setCookieArray) {
			if (!setCookie) continue;
			let cookieParts = setCookie.split(';');
			if (!cookieParts || !Array.isArray(cookieParts)) continue;
			for (let cookie of cookieParts) {
				cookie = cookie.trim();
				cookie = cookie.replace(/;/gm, '');
				const [Key, Value] = cookie.split('=');
				if (!Key || !Value) continue;
				if (Key === cookieName) return Value;
			}
		}
		return false;
	}
}

class WebUntisQR extends WebUntisSecretAuth {
	/**
	 * Use the data you get from a WebUntis QR code
	 * @constructor
	 * @augments WebUntisSecretAuth
	 * @param {string} QRCodeURI A WebUntis uri. This is the data you get from the QR Code from the webuntis webapp under profile->Data access->Display
	 * @param {string} [identity="Awesome"]  A identity like: MyAwesomeApp
	 */
	constructor(QRCodeURI, identity) {
		const uri = new URL(QRCodeURI);
		super(
			uri.searchParams.get('school'),
			uri.searchParams.get('user'),
			uri.searchParams.get('key'),
			uri.searchParams.get('url'),
			identity
		);
	}
}

WebUntis.WebUntisSecretAuth = WebUntisSecretAuth;
WebUntis.WebUntisQR = WebUntisQR;

module.exports = WebUntis;
