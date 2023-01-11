import { serialize } from './cookie';
import axios from 'axios';
import { btoa } from './base-64';
import { parse, startOfDay, format } from 'date-fns';
import type { AxiosInstance } from 'axios';
import type {
    Absences,
    Department,
    Exam,
    Holiday,
    Homework,
    Inbox,
    Klasse,
    Lesson,
    NewsWidget,
    Room,
    SchoolYear,
    StatusData,
    Student,
    Subject,
    Teacher,
    Timegrid,
    WebAPITimetable,
} from './types';
import type { InternalSchoolYear, SessionInformation } from './internal';
import { WebUntisElementType } from './types';

export class Base {
    school: string;
    schoolbase64: string;
    username: string;
    password: string;
    baseurl: string;
    cookies: string[];
    id: string;
    sessionInformation: SessionInformation | null;
    anonymous: boolean;

    axios: AxiosInstance;

    static TYPES = WebUntisElementType;

    /**
     *
     * @constructor
     * @param {string} school The school identifier
     * @param {string} username
     * @param {string} password
     * @param {string} baseurl Just the host name of your WebUntis (Example: mese.webuntis.com)
     * @param {string} [identity="Awesome"] A identity like: MyAwesomeApp
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(
        school: string,
        username: string,
        password: string,
        baseurl: string,
        identity = 'Awesome',
        disableUserAgent = false
    ) {
        this.school = school;
        this.schoolbase64 = '_' + btoa(this.school);
        this.username = username;
        this.password = password;
        this.baseurl = 'https://' + baseurl + '/';
        this.cookies = [];
        this.id = identity;
        this.sessionInformation = {};
        this.anonymous = false;

        const additionalHeaders: Record<string, string> = {};

        if (!disableUserAgent) {
            additionalHeaders['User-Agent'] =
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36';
        }

        this.axios = axios.create({
            baseURL: this.baseurl,
            maxRedirects: 0,
            headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                'X-Requested-With': 'XMLHttpRequest',
                ...additionalHeaders,
            },
            validateStatus: function (status) {
                return status >= 200 && status < 303; // default
            },
        });
    }

    /**
     * Logout the current session
     */
    async logout(): Promise<boolean> {
        await this.axios({
            method: 'POST',
            url: `/WebUntis/jsonrpc.do`,
            params: {
                school: this.school,
            },
            data: {
                id: this.id,
                method: 'logout',
                params: {},
                jsonrpc: '2.0',
            },
        });
        this.sessionInformation = null;
        return true;
    }

    /**
     * Login with your credentials
     *
     * **Notice: The server may revoke this session after less than 10min of idle.**
     *
     * *Untis says in the official docs:*
     * > An application should always log out as soon as possible to free system resources on the server.
     */
    async login(): Promise<SessionInformation> {
        const response = await this.axios({
            method: 'POST',
            url: `/WebUntis/jsonrpc.do`,
            params: {
                school: this.school,
            },
            data: {
                id: this.id,
                method: 'authenticate',
                params: {
                    user: this.username,
                    password: this.password,
                    client: this.id,
                },
                jsonrpc: '2.0',
            },
        });
        if (typeof response.data !== 'object') throw new Error('Failed to parse server response.');
        if (!response.data.result) throw new Error('Failed to login. ' + JSON.stringify(response.data));
        if (response.data.result.code) throw new Error('Login returned error code: ' + response.data.result.code);
        if (!response.data.result.sessionId) throw new Error('Failed to login. No session id.');
        this.sessionInformation = response.data.result;
        return response.data.result;
    }

    /**
     * Get the latest WebUntis Schoolyear
     * @param {Boolean} [validateSession=true]
     */
    async getLatestSchoolyear(validateSession = true): Promise<SchoolYear> {
        const data = await this._request<InternalSchoolYear[]>('getSchoolyears', {}, validateSession);
        data.sort((a, b) => {
            const na = parse(a.startDate, 'yyyyMMdd', new Date());
            const nb = parse(b.startDate, 'yyyyMMdd', new Date());
            return nb.getTime() - na.getTime();
        });
        if (!data[0]) throw new Error('Failed to receive school year');
        return {
            name: data[0].name,
            id: data[0].id,
            startDate: parse(data[0].startDate, 'yyyyMMdd', new Date()),
            endDate: parse(data[0].endDate, 'yyyyMMdd', new Date()),
        };
    }

    /**
     * Get all WebUntis Schoolyears
     * @param {Boolean} [validateSession=true]
     */
    async getSchoolyears(validateSession = true): Promise<SchoolYear[]> {
        const data = await this._request<InternalSchoolYear[]>('getSchoolyears', {}, validateSession);
        data.sort((a, b) => {
            const na = parse(a.startDate, 'yyyyMMdd', new Date());
            const nb = parse(b.startDate, 'yyyyMMdd', new Date());
            return nb.getTime() - na.getTime();
        });
        if (!data[0]) throw new Error('Failed to receive school year');
        return data.map((year) => {
            return {
                name: year.name,
                id: year.id,
                startDate: parse(year.startDate, 'yyyyMMdd', new Date()),
                endDate: parse(year.endDate, 'yyyyMMdd', new Date()),
            };
        });
    }

    /**
     * Get News Widget
     * @param {Date} date
     * @param {boolean} [validateSession=true]
     * @returns {Promise<Object>} see index.d.ts NewsWidget
     */
    async getNewsWidget(date: Date, validateSession = true): Promise<NewsWidget> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/public/news/newsWidgetData`,
            params: {
                date: Base.convertDateToUntis(date),
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (typeof response.data.data !== 'object') throw new Error('Server returned invalid data.');
        return response.data.data;
    }

    /**
     * Get Inbox
     */
    async getInbox(validateSession = true): Promise<Inbox> {
        this._checkAnonymous();
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        //first get JWT Token
        if (typeof this.sessionInformation!.jwt_token != 'string') await this._getJWT();
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/rest/view/v1/messages`,
            headers: {
                Authorization: `Bearer ${this.sessionInformation!.jwt_token}`,
                Cookie: this._buildCookies(),
            },
        });
        if (typeof response.data !== 'object') throw new Error('Server returned invalid data.');
        return response.data;
    }

    private _checkAnonymous() {
        if (this.anonymous) {
            throw new Error('This method is not supported with anonymous login');
        }
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _buildCookies() {
        let cookies = [];
        cookies.push(serialize('JSESSIONID', this.sessionInformation!.sessionId!));
        cookies.push(serialize('schoolname', this.schoolbase64));
        return cookies.join('; ');
    }

    /**
     * Get JWT Token
     * @private
     */
    async _getJWT(validateSession = true): Promise<string> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/token/new`,
            headers: {
                //Authorization: `Bearer ${this._getToken()}`,
                Cookie: this._buildCookies(),
            },
        });

        if (typeof response.data !== 'string') throw new Error('Server returned invalid data.');
        this.sessionInformation!.jwt_token = response.data;
        return response.data;
    }

    /**
     * Checks if your current WebUntis Session is valid
     */
    async validateSession(): Promise<boolean> {
        if (!this.sessionInformation) return false;
        const response = await this.axios({
            method: 'POST',
            url: `/WebUntis/jsonrpc.do`,
            params: {
                school: this.school,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
            data: {
                id: this.id,
                method: 'getLatestImportTime',
                params: {},
                jsonrpc: '2.0',
            },
        });
        return typeof response.data.result === 'number';
    }

    /**
     * Get the time when WebUntis last changed its data
     * @param {Boolean} [validateSession=true]
     */
    async getLatestImportTime(validateSession = true): Promise<number> {
        return this._request('getLatestImportTime', {}, validateSession);
    }

    /**
     *
     * @param id
     * @param type
     * @param startDate
     * @param endDate
     * @param validateSession
     * @private
     */
    private async _timetableRequest(
        id: string | number,
        type: number,
        startDate?: Date | null,
        endDate?: Date | null,
        validateSession = true
    ): Promise<Lesson[]> {
        const additionalOptions: Record<string, unknown> = {};
        if (startDate) {
            additionalOptions.startDate = Base.convertDateToUntis(startDate);
        }
        if (endDate) {
            additionalOptions.endDate = Base.convertDateToUntis(endDate);
        }

        return this._request(
            'getTimetable',
            {
                options: {
                    id: new Date().getTime(),
                    element: {
                        id,
                        type,
                    },
                    ...additionalOptions,
                    showLsText: true,
                    showStudentgroup: true,
                    showLsNumber: true,
                    showSubstText: true,
                    showInfo: true,
                    showBooking: true,
                    klasseFields: ['id', 'name', 'longname', 'externalkey'],
                    roomFields: ['id', 'name', 'longname', 'externalkey'],
                    subjectFields: ['id', 'name', 'longname', 'externalkey'],
                    teacherFields: ['id', 'name', 'longname', 'externalkey'],
                },
            },
            validateSession
        );
    }

    /**
     * Get your own Timetable for the current day
     * Note: You can't use this with anonymous login
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    async getOwnTimetableForToday(validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(
            this.sessionInformation!.personId!,
            this.sessionInformation!.personType!,
            null,
            null,
            validateSession
        );
    }

    /**
     * Get the timetable of today for a specific element.
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    async getTimetableForToday(id: number, type: number, validateSession = true): Promise<Lesson[]> {
        return await this._timetableRequest(id, type, null, null, validateSession);
    }

    /**
     * Get your own Timetable for the given day
     * Note: You can't use this with anonymous login
     * @param {Date} date
     * @param {Boolean} [validateSession=true]
     */
    async getOwnTimetableFor(date: Date, validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(
            this.sessionInformation!.personId!,
            this.sessionInformation!.personType!,
            date,
            date,
            validateSession
        );
    }

    /**
     * Get the timetable for a specific day for a specific element.
     * @param {Date} date
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     */
    async getTimetableFor(date: Date, id: number, type: number, validateSession = true): Promise<Lesson[]> {
        return await this._timetableRequest(id, type, date, date, validateSession);
    }

    /**
     * Get your own timetable for a given Date range
     * Note: You can't use this with anonymous login
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getOwnTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(
            this.sessionInformation!.personId!,
            this.sessionInformation!.personType!,
            rangeStart,
            rangeEnd,
            validateSession
        );
    }

    /**
     * Get the timetable for a given Date range for specific element
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     */
    async getTimetableForRange(
        rangeStart: Date,
        rangeEnd: Date,
        id: number,
        type: number,
        validateSession = true
    ): Promise<Lesson[]> {
        return await this._timetableRequest(id, type, rangeStart, rangeEnd, validateSession);
    }

    /**
     * Get the Timetable of your class for today
     * Note: You can't use this with anonymous login
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    async getOwnClassTimetableForToday(validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(this.sessionInformation!.klasseId!, 1, null, null, validateSession);
    }

    /**
     * Get the Timetable of your class for the given day
     * Note: You can't use this with anonymous login
     * @param {Date} date
     * @param {Boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getOwnClassTimetableFor(date: Date, validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(this.sessionInformation!.klasseId!, 1, date, date, validateSession);
    }

    /**
     * Get the Timetable of your class for a given Date range
     * Note: You can't use this with anonymous login
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     */
    async getOwnClassTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession = true): Promise<Lesson[]> {
        this._checkAnonymous();
        return await this._timetableRequest(
            this.sessionInformation!.klasseId!,
            1,
            rangeStart,
            rangeEnd,
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
    async getHomeWorksFor(rangeStart: Date, rangeEnd: Date, validateSession = true): Promise<Homework[]> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/homeworks/lessons`,
            params: {
                startDate: Base.convertDateToUntis(rangeStart),
                endDate: Base.convertDateToUntis(rangeEnd),
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (typeof response.data.data !== 'object') throw new Error('Server returned invalid data.');
        if (!response.data.data['homeworks']) throw new Error("Data object doesn't contains homeworks object.");
        return response.data.data;
    }

    /**
     * Converts the untis date string format to a normal JS Date object
     * @param {string} date Untis date string
     * @param {Date} [baseDate=new Date()] Base date. Default beginning of current day
     * @static
     */
    static convertUntisDate(date: string, baseDate = startOfDay(new Date())): Date {
        if (typeof date !== 'string') date = `${date}`;
        return parse(date, 'yyyyMMdd', baseDate);
    }

    /**
     * Convert a untis time string to a JS Date object
     * @param {string|number} time Untis time string
     * @param {Date} [baseDate=new Date()] Day used as base for the time. Default: Current date
     * @static
     */
    static convertUntisTime(time: number | string, baseDate = new Date()): Date {
        if (typeof time !== 'string') time = `${time}`;
        return parse(time.padStart(4, '0'), 'Hmm', baseDate);
    }

    /**
     * Get all known Subjects for the current logged-in user
     * @param {boolean} [validateSession=true]
     */
    async getSubjects(validateSession = true): Promise<Subject[]> {
        return await this._request('getSubjects', {}, validateSession);
    }

    /**
     * Get the timegrid of current school
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getTimegrid(validateSession = true): Promise<Timegrid[]> {
        return await this._request('getTimegridUnits', {}, validateSession);
    }

    /**
     *
     * TODO: Find out what type this function returns
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<void>}
     */
    async getHomeWorkAndLessons(rangeStart: Date, rangeEnd: Date, validateSession = true): Promise<Array<any>> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/homeworks/lessons`,
            params: {
                startDate: Base.convertDateToUntis(rangeStart),
                endDate: Base.convertDateToUntis(rangeEnd),
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (typeof response.data.data !== 'object') throw new Error('Server returned invalid data.');
        if (!response.data.data['homeworks']) throw new Error("Data object doesn't contains homeworks object.");
        return response.data.data;
    }

    /**
     * Get Exams for range
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Number} klasseId
     * @param {boolean} withGrades
     * @param {boolean} [validateSession=true]
     */
    async getExamsForRange(
        rangeStart: Date,
        rangeEnd: Date,
        klasseId = -1,
        withGrades = false,
        validateSession = true
    ): Promise<Array<Exam>> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/exams`,
            params: {
                startDate: Base.convertDateToUntis(rangeStart),
                endDate: Base.convertDateToUntis(rangeEnd),
                klasseId: klasseId,
                withGrades: withGrades,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (typeof response.data.data !== 'object') throw new Error('Server returned invalid data.');
        if (!response.data.data['exams']) throw new Error("Data object doesn't contains exams object.");
        return response.data.data['exams'];
    }

    /**
     * Get the timetable for the current week for a specific element from the web client API.
     * @param {Date} date one date in the week to query
     * @param {number} id element id
     * @param {WebUntisElementType} type element type
     * @param {Number} [formatId=1] set to 1 to include teachers, 2 omits the teachers in elements response
     * @param {Boolean} [validateSession=true]
     */
    async getTimetableForWeek(
        date: Date,
        id: number,
        type: number,
        formatId = 1,
        validateSession = true
    ): Promise<WebAPITimetable[]> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');

        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/public/timetable/weekly/data`,
            params: {
                elementType: type,
                elementId: id,
                date: format(date, 'yyyy-MM-dd'),
                formatId: formatId,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });

        if (typeof response.data.data !== 'object') throw new Error('Server returned invalid data.');

        if (response.data.data.error) {
            /* known codes:
             * - ERR_TTVIEW_NOTALLOWED_ONDATE
             */
            const err = new Error('Server responded with error');
            // TODO: Make this better lol
            // @ts-ignore
            err.code = response.data.data.error?.data?.messageKey;
            throw err;
        }

        if (!response.data.data.result?.data?.elementPeriods?.[id]) throw new Error('Invalid response');

        const data = response.data.data.result.data;

        // TODO: improve typings

        const formatElements = (elements: Array<Record<string, unknown>>, { byType }: { byType: number }) => {
            const filteredElements = elements.filter((element) => element.type === byType);

            return filteredElements.map((element) => ({
                ...element,
                element: data.elements.find(
                    (dataElement: Record<string, unknown>) =>
                        dataElement.type === byType && dataElement.id === element.id
                ),
            }));
        };

        const timetable = data.elementPeriods[id].map((lesson: any) => ({
            ...lesson,
            classes: formatElements(lesson.elements, { byType: Base.TYPES.CLASS }),
            teachers: formatElements(lesson.elements, { byType: Base.TYPES.TEACHER }),
            subjects: formatElements(lesson.elements, { byType: Base.TYPES.SUBJECT }),
            rooms: formatElements(lesson.elements, { byType: Base.TYPES.ROOM }),
            students: formatElements(lesson.elements, { byType: Base.TYPES.STUDENT }),
        }));

        return timetable;
    }

    /**
     * Get the timetable for the current week for the current element from the web client API.
     * @param {Date} date one date in the week to query
     * @param {Number} [formatId=1] set to 1 to include teachers, 2 omits the teachers in elements response
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<WebAPITimetable[]>}
     */
    async getOwnTimetableForWeek(date: Date, formatId = 1, validateSession = true): Promise<WebAPITimetable[]> {
        this._checkAnonymous();
        return await this.getTimetableForWeek(
            date,
            this.sessionInformation!.personId!,
            this.sessionInformation!.personType!,
            formatId,
            validateSession
        );
    }

    /**
     * Get all known teachers by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getTeachers(validateSession = true): Promise<Teacher[]> {
        return await this._request('getTeachers', {}, validateSession);
    }

    /**
     * Get all known students by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getStudents(validateSession = true): Promise<Student[]> {
        return await this._request('getStudents', {}, validateSession);
    }

    /**
     * Get all known rooms by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getRooms(validateSession = true): Promise<Room[]> {
        return await this._request('getRooms', {}, validateSession);
    }

    /**
     * Get all classes known by WebUntis
     * @param {boolean} [validateSession=true]
     * @param {number} schoolyearId
     * @returns {Promise.<Array>}
     */
    async getClasses(validateSession = true, schoolyearId: number): Promise<Klasse[]> {
        const data = typeof schoolyearId !== 'number' ? {} : { schoolyearId };
        return await this._request('getKlassen', data, validateSession);
    }

    /**
     * Get all departments known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getDepartments(validateSession = true): Promise<Department[]> {
        return await this._request('getDepartments', {}, validateSession);
    }

    /**
     * Get all holidays known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getHolidays(validateSession = true): Promise<Holiday[]> {
        return await this._request('getHolidays', {}, validateSession);
    }

    /**
     * Get all status data known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    async getStatusData(validateSession = true): Promise<StatusData> {
        return await this._request('getStatusData', {}, validateSession);
    }

    /**
     * Convert a JS Date Object to a WebUntis date string
     * @param {Date} date
     * @returns {String}
     */
    static convertDateToUntis(date: Date): string {
        return (
            date.getFullYear().toString() +
            (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1).toString() +
            (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()).toString()
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
    async _request<Response = Record<string, any>>(
        method: string,
        parameter: Record<string, any> = {},
        validateSession = true,
        url = `/WebUntis/jsonrpc.do`
    ): Promise<Response> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        const response = await this.axios({
            method: 'POST',
            url: url,
            params: {
                school: this.school,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
            data: {
                id: this.id,
                method: method,
                params: parameter,
                jsonrpc: '2.0',
            },
        });
        if (!response.data.result) throw new Error("Server didn't return any result.");
        if (response.data.result.code) throw new Error('Server returned error code: ' + response.data.result.code);
        return response.data.result;
    }

    /**
     * Returns all the Lessons where you were absent including the excused one!
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Integer} [excuseStatusId=-1]
     * @param {boolean} [validateSession=true]
     * @returns {Promise<Absences>}
     */
    async getAbsentLesson(
        rangeStart: Date,
        rangeEnd: Date,
        excuseStatusId = -1,
        validateSession = true
    ): Promise<Absences> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        this._checkAnonymous();
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/api/classreg/absences/students`,
            params: {
                startDate: Base.convertDateToUntis(rangeStart),
                endDate: Base.convertDateToUntis(rangeEnd),
                studentId: this.sessionInformation!.personId!,
                excuseStatusId: excuseStatusId,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (response.data.data == null) throw new Error('Server returned no data!');
        return response.data.data;
    }

    /**
     * Returns a URL to a unique PDF of all the lessons you were absent
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     * @param {Integer} [excuseStatusId=-1]
     * @param {boolean} [lateness=true]
     * @param {boolean} [absences=true]
     * @param {boolean} [excuseGroup=2]
     */
    async getPdfOfAbsentLesson(
        rangeStart: Date,
        rangeEnd: Date,
        validateSession = true,
        excuseStatusId = -1,
        lateness = true,
        absences = true,
        excuseGroup = 2
    ): Promise<string> {
        if (validateSession && !(await this.validateSession())) throw new Error('Current Session is not valid');
        this._checkAnonymous();
        const response = await this.axios({
            method: 'GET',
            url: `/WebUntis/reports.do`,
            params: {
                name: 'Excuse',
                format: 'pdf',
                rpt_sd: Base.convertDateToUntis(rangeStart),
                rpt_ed: Base.convertDateToUntis(rangeEnd),
                excuseStatusId: excuseStatusId,
                studentId: this.sessionInformation!.personId!,
                withLateness: lateness,
                withAbsences: absences,
                execuseGroup: excuseGroup,
            },
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        const res = response.data.data;
        if (response.status != 200 || res.error) throw new Error('Server returned no data!');
        const pdfDownloadURL =
            this.baseurl + 'WebUntis/reports.do?' + 'msgId=' + res.messageId + '&' + res.reportParams;
        return pdfDownloadURL;
    }
}

/**
 * @private
 */
export class InternalWebuntisSecretLogin extends Base {
    constructor(
        school: string,
        username: string,
        password: string,
        baseurl: string,
        identity = 'Awesome',
        disableUserAgent = false
    ) {
        super(school, username, password, baseurl, identity, disableUserAgent);
    }

    async _otpLogin(token: number | string, username: string, time: number, skipSessionInfo = false) {
        const response = await this.axios({
            method: 'POST',
            url: '/WebUntis/jsonrpc_intern.do',
            params: {
                m: 'getUserData2017',
                school: this.school,
                v: 'i2.2',
            },
            data: {
                id: this.id,
                method: 'getUserData2017',
                params: [
                    {
                        auth: {
                            clientTime: time,
                            user: username,
                            otp: token,
                        },
                    },
                ],
                jsonrpc: '2.0',
            },
        });
        if (response.data && response.data.error)
            throw new Error('Failed to login. ' + (response.data.error.message || ''));
        if (!response.headers['set-cookie']) throw new Error(`Failed to login. Server didn't return a set-cookie`);
        if (!this._getCookieFromSetCookie(response.headers['set-cookie']))
            throw new Error("Failed to login. Server didn't return a session id.");
        const sessionId = this._getCookieFromSetCookie(response.headers['set-cookie']);
        // Set session temporary
        this.sessionInformation = {
            sessionId: sessionId,
        };
        if (skipSessionInfo) return this.sessionInformation;

        // Get personId & personType
        const appConfigUrl = `/WebUntis/api/app/config`;
        const configResponse = await this.axios({
            method: 'GET',
            url: appConfigUrl,
            headers: {
                Cookie: this._buildCookies(),
            },
        });
        if (typeof configResponse.data !== 'object' || typeof configResponse.data.data !== 'object')
            throw new Error('Failed to fetch app config while login. data (type): ' + typeof response.data);
        // Path -> data.loginServiceConfig.user.persons -> find person with id
        if (
            configResponse.data.data &&
            configResponse.data.data.loginServiceConfig &&
            configResponse.data.data.loginServiceConfig.user &&
            !Number.isInteger(configResponse.data.data.loginServiceConfig.user.personId)
        )
            throw new Error('Invalid personId. personId: ' + configResponse.data.data.loginServiceConfig.user.personId);
        const webUntisLoginServiceUser = configResponse.data.data.loginServiceConfig.user;
        if (!Array.isArray(webUntisLoginServiceUser.persons))
            throw new Error('Invalid person array. persons (type): ' + typeof webUntisLoginServiceUser.persons);
        const person = webUntisLoginServiceUser.persons.find(
            (value: Record<string, unknown>) => value.id === configResponse.data.data.loginServiceConfig.user.personId
        );
        if (!person) throw new Error('Can not find person in person array.');
        if (!Number.isInteger(person.type)) throw new Error('Invalid person type. type (type): ' + person.type);
        this.sessionInformation = {
            sessionId: sessionId,
            personType: person.type,
            personId: configResponse.data.data.loginServiceConfig.user.personId,
        };
        // Get klasseId
        try {
            const dayConfigUrl = `/WebUntis/api/daytimetable/config`;
            const dayConfigResponse = await this.axios({
                method: 'GET',
                url: dayConfigUrl,
                headers: {
                    Cookie: this._buildCookies(),
                },
            });
            if (typeof dayConfigResponse.data !== 'object' || typeof dayConfigResponse.data.data !== 'object')
                throw new Error();
            if (!Number.isInteger(dayConfigResponse.data.data.klasseId)) throw new Error();
            this.sessionInformation = {
                sessionId: sessionId,
                personType: person.type,
                personId: configResponse.data.data.loginServiceConfig.user.personId,
                klasseId: dayConfigResponse.data.data.klasseId,
            };
        } catch (e) {
            // klasseId is not important. This request can fail
        }
        return this.sessionInformation;
    }

    /**
     *
     * @param {Array} setCookieArray
     * @param {string} [cookieName="JSESSIONID"]
     * @return {string|boolean}
     * @private
     */
    _getCookieFromSetCookie(setCookieArray?: string[], cookieName = 'JSESSIONID') {
        if (!setCookieArray) return;
        for (let i = 0; i < setCookieArray.length; i++) {
            const setCookie = setCookieArray[i];
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
    }
}
