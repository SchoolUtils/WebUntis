'use strict';

var axios = require('axios');
var dateFns = require('date-fns');

const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function serialize(name, val, opt = {}) {
  if (!opt.encode)
    opt.encode = encodeURIComponent;
  if (!fieldContentRegExp.test(name))
    throw new TypeError("argument name is invalid");
  const value = opt.encode(val);
  if (value && !fieldContentRegExp.test(value))
    throw new TypeError("argument val is invalid");
  let str = name + "=" + value;
  if (null != opt.maxAge) {
    const maxAge = opt.maxAge - 0;
    if (isNaN(maxAge) || !isFinite(maxAge))
      throw new TypeError("option maxAge is invalid");
    str += "; Max-Age=" + Math.floor(maxAge);
  }
  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain))
      throw new TypeError("option domain is invalid");
    str += "; Domain=" + opt.domain;
  }
  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path))
      throw new TypeError("option path is invalid");
    str += "; Path=" + opt.path;
  }
  if (opt.expires)
    str += "; Expires=" + opt.expires.toUTCString();
  if (opt.httpOnly)
    str += "; HttpOnly";
  if (opt.secure)
    str += "; Secure";
  if (opt.sameSite) {
    const sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
    switch (sameSite) {
      case true:
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return str;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function btoa(input = "") {
  let str = input;
  let output = "";
  for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = "=", i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);
    if (charCode > 255) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  return output;
}

var WebUntisDay = /* @__PURE__ */ ((WebUntisDay2) => {
  WebUntisDay2[WebUntisDay2["Sunday"] = 1] = "Sunday";
  WebUntisDay2[WebUntisDay2["Monday"] = 2] = "Monday";
  WebUntisDay2[WebUntisDay2["Tuesday"] = 3] = "Tuesday";
  WebUntisDay2[WebUntisDay2["Wednesday"] = 4] = "Wednesday";
  WebUntisDay2[WebUntisDay2["Thursday"] = 5] = "Thursday";
  WebUntisDay2[WebUntisDay2["Friday"] = 6] = "Friday";
  WebUntisDay2[WebUntisDay2["Saturday"] = 7] = "Saturday";
  return WebUntisDay2;
})(WebUntisDay || {});
var WebUntisElementType = /* @__PURE__ */ ((WebUntisElementType2) => {
  WebUntisElementType2[WebUntisElementType2["CLASS"] = 1] = "CLASS";
  WebUntisElementType2[WebUntisElementType2["TEACHER"] = 2] = "TEACHER";
  WebUntisElementType2[WebUntisElementType2["SUBJECT"] = 3] = "SUBJECT";
  WebUntisElementType2[WebUntisElementType2["ROOM"] = 4] = "ROOM";
  WebUntisElementType2[WebUntisElementType2["STUDENT"] = 5] = "STUDENT";
  return WebUntisElementType2;
})(WebUntisElementType || {});

class Base {
  school;
  schoolbase64;
  username;
  password;
  baseurl;
  cookies;
  id;
  sessionInformation;
  anonymous;
  axios;
  static TYPES = WebUntisElementType;
  constructor(school, username, password, baseurl, identity = "Awesome", disableUserAgent = false) {
    this.school = school;
    this.schoolbase64 = "_" + btoa(this.school);
    this.username = username;
    this.password = password;
    this.baseurl = "https://" + baseurl + "/";
    this.cookies = [];
    this.id = identity;
    this.sessionInformation = {};
    this.anonymous = false;
    const additionalHeaders = {};
    if (!disableUserAgent) {
      additionalHeaders["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36";
    }
    this.axios = axios.create({
      baseURL: this.baseurl,
      maxRedirects: 0,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "X-Requested-With": "XMLHttpRequest",
        ...additionalHeaders
      },
      validateStatus: function(status) {
        return status >= 200 && status < 303;
      }
    });
  }
  async logout() {
    await this.axios({
      method: "POST",
      url: `/WebUntis/jsonrpc.do`,
      params: {
        school: this.school
      },
      data: {
        id: this.id,
        method: "logout",
        params: {},
        jsonrpc: "2.0"
      }
    });
    this.sessionInformation = null;
    return true;
  }
  async login() {
    const response = await this.axios({
      method: "POST",
      url: `/WebUntis/jsonrpc.do`,
      params: {
        school: this.school
      },
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
    if (typeof response.data !== "object")
      throw new Error("Failed to parse server response.");
    if (!response.data.result)
      throw new Error("Failed to login. " + JSON.stringify(response.data));
    if (response.data.result.code)
      throw new Error("Login returned error code: " + response.data.result.code);
    if (!response.data.result.sessionId)
      throw new Error("Failed to login. No session id.");
    this.sessionInformation = response.data.result;
    return response.data.result;
  }
  async getLatestSchoolyear(validateSession = true) {
    const data = await this._request("getSchoolyears", {}, validateSession);
    data.sort((a, b) => {
      const na = dateFns.parse(a.startDate, "yyyyMMdd", new Date());
      const nb = dateFns.parse(b.startDate, "yyyyMMdd", new Date());
      return nb.getTime() - na.getTime();
    });
    if (!data[0])
      throw new Error("Failed to receive school year");
    return {
      name: data[0].name,
      id: data[0].id,
      startDate: dateFns.parse(data[0].startDate, "yyyyMMdd", new Date()),
      endDate: dateFns.parse(data[0].endDate, "yyyyMMdd", new Date())
    };
  }
  async getSchoolyears(validateSession = true) {
    const data = await this._request("getSchoolyears", {}, validateSession);
    data.sort((a, b) => {
      const na = dateFns.parse(a.startDate, "yyyyMMdd", new Date());
      const nb = dateFns.parse(b.startDate, "yyyyMMdd", new Date());
      return nb.getTime() - na.getTime();
    });
    if (!data[0])
      throw new Error("Failed to receive school year");
    return data.map((year) => {
      return {
        name: year.name,
        id: year.id,
        startDate: dateFns.parse(year.startDate, "yyyyMMdd", new Date()),
        endDate: dateFns.parse(year.endDate, "yyyyMMdd", new Date())
      };
    });
  }
  async getNewsWidget(date, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/public/news/newsWidgetData`,
      params: {
        date: Base.convertDateToUntis(date)
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data.data !== "object")
      throw new Error("Server returned invalid data.");
    return response.data.data;
  }
  async getInbox(validateSession = true) {
    this._checkAnonymous();
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    if (typeof this.sessionInformation.jwt_token != "string")
      await this._getJWT();
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/rest/view/v1/messages`,
      headers: {
        Authorization: `Bearer ${this.sessionInformation.jwt_token}`,
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data !== "object")
      throw new Error("Server returned invalid data.");
    return response.data;
  }
  _checkAnonymous() {
    if (this.anonymous) {
      throw new Error("This method is not supported with anonymous login");
    }
  }
  _buildCookies() {
    let cookies = [];
    cookies.push(serialize("JSESSIONID", this.sessionInformation.sessionId));
    cookies.push(serialize("schoolname", this.schoolbase64));
    return cookies.join("; ");
  }
  async _getJWT(validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/token/new`,
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data !== "string")
      throw new Error("Server returned invalid data.");
    this.sessionInformation.jwt_token = response.data;
    return response.data;
  }
  async validateSession() {
    if (!this.sessionInformation)
      return false;
    const response = await this.axios({
      method: "POST",
      url: `/WebUntis/jsonrpc.do`,
      params: {
        school: this.school
      },
      headers: {
        Cookie: this._buildCookies()
      },
      data: {
        id: this.id,
        method: "getLatestImportTime",
        params: {},
        jsonrpc: "2.0"
      }
    });
    return typeof response.data.result === "number";
  }
  async getLatestImportTime(validateSession = true) {
    return this._request("getLatestImportTime", {}, validateSession);
  }
  async _timetableRequest(id, type, startDate, endDate, validateSession = true) {
    const additionalOptions = {};
    if (startDate) {
      additionalOptions.startDate = Base.convertDateToUntis(startDate);
    }
    if (endDate) {
      additionalOptions.endDate = Base.convertDateToUntis(endDate);
    }
    return this._request(
      "getTimetable",
      {
        options: {
          id: new Date().getTime(),
          element: {
            id,
            type
          },
          ...additionalOptions,
          showLsText: true,
          showStudentgroup: true,
          showLsNumber: true,
          showSubstText: true,
          showInfo: true,
          showBooking: true,
          klasseFields: ["id", "name", "longname", "externalkey"],
          roomFields: ["id", "name", "longname", "externalkey"],
          subjectFields: ["id", "name", "longname", "externalkey"],
          teacherFields: ["id", "name", "longname", "externalkey"]
        }
      },
      validateSession
    );
  }
  async getOwnTimetableForToday(validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(
      this.sessionInformation.personId,
      this.sessionInformation.personType,
      null,
      null,
      validateSession
    );
  }
  async getTimetableForToday(id, type, validateSession = true) {
    return await this._timetableRequest(id, type, null, null, validateSession);
  }
  async getOwnTimetableFor(date, validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(
      this.sessionInformation.personId,
      this.sessionInformation.personType,
      date,
      date,
      validateSession
    );
  }
  async getTimetableFor(date, id, type, validateSession = true) {
    return await this._timetableRequest(id, type, date, date, validateSession);
  }
  async getOwnTimetableForRange(rangeStart, rangeEnd, validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(
      this.sessionInformation.personId,
      this.sessionInformation.personType,
      rangeStart,
      rangeEnd,
      validateSession
    );
  }
  async getTimetableForRange(rangeStart, rangeEnd, id, type, validateSession = true) {
    return await this._timetableRequest(id, type, rangeStart, rangeEnd, validateSession);
  }
  async getOwnClassTimetableForToday(validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(this.sessionInformation.klasseId, 1, null, null, validateSession);
  }
  async getOwnClassTimetableFor(date, validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(this.sessionInformation.klasseId, 1, date, date, validateSession);
  }
  async getOwnClassTimetableForRange(rangeStart, rangeEnd, validateSession = true) {
    this._checkAnonymous();
    return await this._timetableRequest(
      this.sessionInformation.klasseId,
      1,
      rangeStart,
      rangeEnd,
      validateSession
    );
  }
  async getHomeWorksFor(rangeStart, rangeEnd, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/homeworks/lessons`,
      params: {
        startDate: Base.convertDateToUntis(rangeStart),
        endDate: Base.convertDateToUntis(rangeEnd)
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data.data !== "object")
      throw new Error("Server returned invalid data.");
    if (!response.data.data["homeworks"])
      throw new Error("Data object doesn't contains homeworks object.");
    return response.data.data;
  }
  static convertUntisDate(date, baseDate = dateFns.startOfDay(new Date())) {
    if (typeof date !== "string")
      date = `${date}`;
    return dateFns.parse(date, "yyyyMMdd", baseDate);
  }
  static convertUntisTime(time, baseDate = new Date()) {
    if (typeof time !== "string")
      time = `${time}`;
    return dateFns.parse(time.padStart(4, "0"), "Hmm", baseDate);
  }
  async getSubjects(validateSession = true) {
    return await this._request("getSubjects", {}, validateSession);
  }
  async getTimegrid(validateSession = true) {
    return await this._request("getTimegridUnits", {}, validateSession);
  }
  async getHomeWorkAndLessons(rangeStart, rangeEnd, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/homeworks/lessons`,
      params: {
        startDate: Base.convertDateToUntis(rangeStart),
        endDate: Base.convertDateToUntis(rangeEnd)
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data.data !== "object")
      throw new Error("Server returned invalid data.");
    if (!response.data.data["homeworks"])
      throw new Error("Data object doesn't contains homeworks object.");
    return response.data.data;
  }
  async getExamsForRange(rangeStart, rangeEnd, klasseId = -1, withGrades = false, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/exams`,
      params: {
        startDate: Base.convertDateToUntis(rangeStart),
        endDate: Base.convertDateToUntis(rangeEnd),
        klasseId,
        withGrades
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data.data !== "object")
      throw new Error("Server returned invalid data.");
    if (!response.data.data["exams"])
      throw new Error("Data object doesn't contains exams object.");
    return response.data.data["exams"];
  }
  async getTimetableForWeek(date, id, type, formatId = 1, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/public/timetable/weekly/data`,
      params: {
        elementType: type,
        elementId: id,
        date: dateFns.format(date, "yyyy-MM-dd"),
        formatId
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof response.data.data !== "object")
      throw new Error("Server returned invalid data.");
    if (response.data.data.error) {
      const err = new Error("Server responded with error");
      err.code = response.data.data.error?.data?.messageKey;
      throw err;
    }
    if (!response.data.data.result?.data?.elementPeriods?.[id])
      throw new Error("Invalid response");
    const data = response.data.data.result.data;
    const formatElements = (elements, { byType }) => {
      const filteredElements = elements.filter((element) => element.type === byType);
      return filteredElements.map((element) => ({
        ...element,
        element: data.elements.find(
          (dataElement) => dataElement.type === byType && dataElement.id === element.id
        )
      }));
    };
    const timetable = data.elementPeriods[id].map((lesson) => ({
      ...lesson,
      classes: formatElements(lesson.elements, { byType: Base.TYPES.CLASS }),
      teachers: formatElements(lesson.elements, { byType: Base.TYPES.TEACHER }),
      subjects: formatElements(lesson.elements, { byType: Base.TYPES.SUBJECT }),
      rooms: formatElements(lesson.elements, { byType: Base.TYPES.ROOM }),
      students: formatElements(lesson.elements, { byType: Base.TYPES.STUDENT })
    }));
    return timetable;
  }
  async getOwnTimetableForWeek(date, formatId = 1, validateSession = true) {
    this._checkAnonymous();
    return await this.getTimetableForWeek(
      date,
      this.sessionInformation.personId,
      this.sessionInformation.personType,
      formatId,
      validateSession
    );
  }
  async getTeachers(validateSession = true) {
    return await this._request("getTeachers", {}, validateSession);
  }
  async getStudents(validateSession = true) {
    return await this._request("getStudents", {}, validateSession);
  }
  async getRooms(validateSession = true) {
    return await this._request("getRooms", {}, validateSession);
  }
  async getClasses(validateSession = true, schoolyearId) {
    const data = typeof schoolyearId !== "number" ? {} : { schoolyearId };
    return await this._request("getKlassen", data, validateSession);
  }
  async getDepartments(validateSession = true) {
    return await this._request("getDepartments", {}, validateSession);
  }
  async getHolidays(validateSession = true) {
    return await this._request("getHolidays", {}, validateSession);
  }
  async getStatusData(validateSession = true) {
    return await this._request("getStatusData", {}, validateSession);
  }
  static convertDateToUntis(date) {
    return date.getFullYear().toString() + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1).toString() + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()).toString();
  }
  async _request(method, parameter = {}, validateSession = true, url = `/WebUntis/jsonrpc.do`) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    const response = await this.axios({
      method: "POST",
      url,
      params: {
        school: this.school
      },
      headers: {
        Cookie: this._buildCookies()
      },
      data: {
        id: this.id,
        method,
        params: parameter,
        jsonrpc: "2.0"
      }
    });
    if (!response.data.result)
      throw new Error("Server didn't return any result.");
    if (response.data.result.code)
      throw new Error("Server returned error code: " + response.data.result.code);
    return response.data.result;
  }
  async getAbsentLesson(rangeStart, rangeEnd, excuseStatusId = -1, validateSession = true) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    this._checkAnonymous();
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/api/classreg/absences/students`,
      params: {
        startDate: Base.convertDateToUntis(rangeStart),
        endDate: Base.convertDateToUntis(rangeEnd),
        studentId: this.sessionInformation.personId,
        excuseStatusId
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (response.data.data == null)
      throw new Error("Server returned no data!");
    return response.data.data;
  }
  async getPdfOfAbsentLesson(rangeStart, rangeEnd, validateSession = true, excuseStatusId = -1, lateness = true, absences = true, excuseGroup = 2) {
    if (validateSession && !await this.validateSession())
      throw new Error("Current Session is not valid");
    this._checkAnonymous();
    const response = await this.axios({
      method: "GET",
      url: `/WebUntis/reports.do`,
      params: {
        name: "Excuse",
        format: "pdf",
        rpt_sd: Base.convertDateToUntis(rangeStart),
        rpt_ed: Base.convertDateToUntis(rangeEnd),
        excuseStatusId,
        studentId: this.sessionInformation.personId,
        withLateness: lateness,
        withAbsences: absences,
        execuseGroup: excuseGroup
      },
      headers: {
        Cookie: this._buildCookies()
      }
    });
    const res = response.data.data;
    if (response.status != 200 || res.error)
      throw new Error("Server returned no data!");
    const pdfDownloadURL = this.baseurl + "WebUntis/reports.do?msgId=" + res.messageId + "&" + res.reportParams;
    return pdfDownloadURL;
  }
}
class InternalWebuntisSecretLogin extends Base {
  constructor(school, username, password, baseurl, identity = "Awesome", disableUserAgent = false) {
    super(school, username, password, baseurl, identity, disableUserAgent);
  }
  async _otpLogin(token, username, time, skipSessionInfo = false) {
    const response = await this.axios({
      method: "POST",
      url: "/WebUntis/jsonrpc_intern.do",
      params: {
        m: "getUserData2017",
        school: this.school,
        v: "i2.2"
      },
      data: {
        id: this.id,
        method: "getUserData2017",
        params: [
          {
            auth: {
              clientTime: time,
              user: username,
              otp: token
            }
          }
        ],
        jsonrpc: "2.0"
      }
    });
    if (response.data && response.data.error)
      throw new Error("Failed to login. " + (response.data.error.message || ""));
    if (!response.headers["set-cookie"])
      throw new Error(`Failed to login. Server didn't return a set-cookie`);
    if (!this._getCookieFromSetCookie(response.headers["set-cookie"]))
      throw new Error("Failed to login. Server didn't return a session id.");
    const sessionId = this._getCookieFromSetCookie(response.headers["set-cookie"]);
    this.sessionInformation = {
      sessionId
    };
    if (skipSessionInfo)
      return this.sessionInformation;
    const appConfigUrl = `/WebUntis/api/app/config`;
    const configResponse = await this.axios({
      method: "GET",
      url: appConfigUrl,
      headers: {
        Cookie: this._buildCookies()
      }
    });
    if (typeof configResponse.data !== "object" || typeof configResponse.data.data !== "object")
      throw new Error("Failed to fetch app config while login. data (type): " + typeof response.data);
    if (configResponse.data.data && configResponse.data.data.loginServiceConfig && configResponse.data.data.loginServiceConfig.user && !Number.isInteger(configResponse.data.data.loginServiceConfig.user.personId))
      throw new Error("Invalid personId. personId: " + configResponse.data.data.loginServiceConfig.user.personId);
    const webUntisLoginServiceUser = configResponse.data.data.loginServiceConfig.user;
    if (!Array.isArray(webUntisLoginServiceUser.persons))
      throw new Error("Invalid person array. persons (type): " + typeof webUntisLoginServiceUser.persons);
    const person = webUntisLoginServiceUser.persons.find(
      (value) => value.id === configResponse.data.data.loginServiceConfig.user.personId
    );
    if (!person)
      throw new Error("Can not find person in person array.");
    if (!Number.isInteger(person.type))
      throw new Error("Invalid person type. type (type): " + person.type);
    this.sessionInformation = {
      sessionId,
      personType: person.type,
      personId: configResponse.data.data.loginServiceConfig.user.personId
    };
    try {
      const dayConfigUrl = `/WebUntis/api/daytimetable/config`;
      const dayConfigResponse = await this.axios({
        method: "GET",
        url: dayConfigUrl,
        headers: {
          Cookie: this._buildCookies()
        }
      });
      if (typeof dayConfigResponse.data !== "object" || typeof dayConfigResponse.data.data !== "object")
        throw new Error();
      if (!Number.isInteger(dayConfigResponse.data.data.klasseId))
        throw new Error();
      this.sessionInformation = {
        sessionId,
        personType: person.type,
        personId: configResponse.data.data.loginServiceConfig.user.personId,
        klasseId: dayConfigResponse.data.data.klasseId
      };
    } catch (e) {
    }
    return this.sessionInformation;
  }
  _getCookieFromSetCookie(setCookieArray, cookieName = "JSESSIONID") {
    if (!setCookieArray)
      return;
    for (let i = 0; i < setCookieArray.length; i++) {
      const setCookie = setCookieArray[i];
      if (!setCookie)
        continue;
      let cookieParts = setCookie.split(";");
      if (!cookieParts || !Array.isArray(cookieParts))
        continue;
      for (let cookie of cookieParts) {
        cookie = cookie.trim();
        cookie = cookie.replace(/;/gm, "");
        const [Key, Value] = cookie.split("=");
        if (!Key || !Value)
          continue;
        if (Key === cookieName)
          return Value;
      }
    }
  }
}

class WebUntisSecretAuth extends InternalWebuntisSecretLogin {
  secret;
  authenticator;
  constructor(school, user, secret, baseurl, identity = "Awesome", authenticator, disableUserAgent = false) {
    super(school, user, null, baseurl, identity, disableUserAgent);
    this.secret = secret;
    this.authenticator = authenticator;
    if (!authenticator) {
      if ("import" in globalThis) {
        throw new Error(
          "You need to provide the otplib object by yourself. We can not eval the require in ESM mode."
        );
      }
      const { authenticator } = eval("require('otplib')");
      this.authenticator = authenticator;
    }
  }
  async login() {
    const token = this.authenticator.generate(this.secret);
    const time = new Date().getTime();
    return await this._otpLogin(token, this.username, time);
  }
}

class WebUntisQR extends WebUntisSecretAuth {
  constructor(QRCodeURI, identity, authenticator, URL, disableUserAgent = false) {
    let URLImplementation = URL;
    if (!URL) {
      if ("import" in globalThis) {
        throw new Error(
          "You need to provide the URL object by yourself. We can not eval the require in ESM mode."
        );
      }
      URLImplementation = eval("require('url').URL");
    }
    const uri = new URLImplementation(QRCodeURI);
    super(
      uri.searchParams.get("school"),
      uri.searchParams.get("user"),
      uri.searchParams.get("key"),
      uri.searchParams.get("url"),
      identity,
      authenticator,
      disableUserAgent
    );
  }
}

class WebUntisAnonymousAuth extends InternalWebuntisSecretLogin {
  constructor(school, baseurl, identity = "Awesome", disableUserAgent = false) {
    super(school, null, null, baseurl, identity, disableUserAgent);
    this.username = "#anonymous#";
    this.anonymous = true;
  }
  async login() {
    const url = `/WebUntis/jsonrpc_intern.do`;
    const response = await this.axios({
      method: "POST",
      url,
      params: {
        m: "getAppSharedSecret",
        school: this.school,
        v: "i3.5"
      },
      data: {
        id: this.id,
        method: "getAppSharedSecret",
        params: [
          {
            userName: "#anonymous#",
            password: ""
          }
        ],
        jsonrpc: "2.0"
      }
    });
    if (response.data && response.data.error)
      throw new Error("Failed to login. " + (response.data.error.message || ""));
    const otp = 100170;
    const time = new Date().getTime();
    return await this._otpLogin(otp, this.username, time, true);
  }
}

exports.Base = Base;
exports.InternalWebuntisSecretLogin = InternalWebuntisSecretLogin;
exports.WebUntis = Base;
exports.WebUntisAnonymousAuth = WebUntisAnonymousAuth;
exports.WebUntisDay = WebUntisDay;
exports.WebUntisElementType = WebUntisElementType;
exports.WebUntisQR = WebUntisQR;
exports.WebUntisSecretAuth = WebUntisSecretAuth;
//# sourceMappingURL=webuntis.js.map
