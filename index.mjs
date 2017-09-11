import axios from 'axios';
import qs from 'qs';
import setCookie from 'set-cookie-parser';

class WebUntis {

	constructor(school, username, password, baseurl) {
		this.school = school;
		this.username = username;
		this.password = password;
		this.baseurl = "https://" + baseurl + "/";
		this.cookies = [];

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

	async requestJSESSIONIDAndSchoolname() {
		const response = await this.axios({
			url: '/WebUntis/j_spring_security_check',
			method: "POST",
			data: qs.stringify({
				"school": this.school,
				"login_url": "/login.do"
			}),
			maxRedirects: 0,
			headers: {
				'Content-type': 'application/x-www-form-urlencoded'
			}
		});
		let cookies = setCookie.parse(response.headers["set-cookie"]);
		let jsSessionID;
		let schoolname;
		for (let cookie of cookies) {
			if (cookie.name === "JSESSIONID") {
				jsSessionID = cookie.value;
			}
			if (cookie.name === "schoolname") {
				schoolname = cookie.value;
			}
		}
		if (!jsSessionID || !schoolname) {
			throw new Error("No JSESSIONID or no schoolname");
		}
		this.cookies = cookies;
		return this.cookies;
	}

}

export default WebUntis;