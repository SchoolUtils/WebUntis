import { AxiosInstance } from 'axios';
import { authenticator } from 'otplib';
import { URL } from 'url';

interface SchoolYear {
    name: string;
    id: number;
    startDate: Date;
    endDate: Date;
}
interface MessagesOfDay {
    id: number;
    subject: string;
    text: string;
    isExpanded: boolean;
    /**
     * Unknown type. I have never seen this in use.
     */
    attachments: any[];
}
interface NewsWidget {
    /**
     * Unknown type. I have never seen this in use.
     */
    systemMessage: any;
    messagesOfDay: MessagesOfDay[];
    rssUrl: string;
}
interface Messagesender {
    userId: number;
    displayName: string;
    imageUrl: string;
    className: string;
}
interface Inboxmessage {
    allowMessageDeletion: boolean;
    contentPreview: string;
    hasAttachments: boolean;
    id: number;
    isMessageRead: boolean;
    isReply: boolean;
    isReplyAllowed: boolean;
    sender: Messagesender;
    sentDateTime: string;
    subject: string;
}
interface Inbox {
    incomingMessages: Inboxmessage[];
}
interface ShortData {
    id: number;
    name: string;
    longname: string;
}
interface Lesson {
    id: number;
    date: number;
    startTime: number;
    endTime: number;
    kl: ShortData[];
    te: ShortData[];
    su: ShortData[];
    ro: ShortData[];
    lstext?: string;
    lsnumber: number;
    activityType?: 'Unterricht' | string;
    code?: 'cancelled' | 'irregular';
    info?: string;
    substText?: string;
    statflags?: string;
    sg?: string;
    bkRemark?: string;
    bkText?: string;
}
interface Homework {
    /**
     * Unknown type. I have never seen this in use.
     */
    attachments: Array<any>;
    completed: boolean;
    date: number;
    dueDate: number;
    id: number;
    lessonId: number;
    remark: string;
    text: string;
}
interface Subject {
    id: number;
    name: string;
    longName: string;
    alternateName: string | '';
    active: boolean;
    foreColor: string;
    backColor: string;
}
declare enum WebUntisDay {
    Sunday = 1,
    Monday = 2,
    Tuesday = 3,
    Wednesday = 4,
    Thursday = 5,
    Friday = 6,
    Saturday = 7
}
interface TimeUnit {
    name: string;
    startTime: number;
    endTime: number;
}
interface Timegrid {
    day: WebUntisDay;
    timeUnits: TimeUnit[];
}
interface Exam {
    id: number;
    examType: string;
    name: string;
    studentClass: string[];
    assignedStudents: {
        klasse: {
            id: number;
            name: string;
        };
        displayName: string;
        id: number;
    }[];
    examDate: number;
    startTime: number;
    endTime: number;
    subject: string;
    teachers: string[];
    rooms: string[];
    text: string;
    grade?: string;
}
declare enum WebUntisElementType {
    CLASS = 1,
    TEACHER = 2,
    SUBJECT = 3,
    ROOM = 4,
    STUDENT = 5
}
interface WebElement {
    type: WebUntisElementType;
    id: number;
    orgId: number;
    missing: boolean;
    state: 'REGULAR' | 'ABSENT' | 'SUBSTITUTED';
}
interface WebElementData extends WebElement {
    element: {
        type: number;
        id: number;
        name: string;
        longName?: string;
        displayname?: string;
        alternatename?: string;
        canViewTimetable: boolean;
        externalKey?: string;
        roomCapacity: number;
    };
}
interface WebAPITimetable {
    id: number;
    lessonId: number;
    lessonNumber: number;
    lessonCode: string;
    lessonText: string;
    periodText: string;
    hasPeriodText: false;
    periodInfo: string;
    periodAttachments: [];
    substText: string;
    date: number;
    startTime: number;
    endTime: number;
    elements: WebElement[];
    studentGroup: string;
    hasInfo: boolean;
    code: number;
    cellState: 'STANDARD' | 'SUBSTITUTION' | 'ROOMSUBSTITUTION';
    priority: number;
    is: {
        roomSubstitution?: boolean;
        substitution?: boolean;
        standard?: boolean;
        event: boolean;
    };
    roomCapacity: number;
    studentCount: number;
    classes: WebElementData[];
    teachers: WebElementData[];
    subjects: WebElementData[];
    rooms: WebElementData[];
    students: WebElementData[];
}
interface Teacher {
    id: number;
    name: string;
    foreName: string;
    longName: string;
    foreColor: string;
    backColor: string;
}
interface Student {
    id: number;
    key: number;
    name: string;
    foreName: string;
    longName: string;
    gender: string;
}
interface Room {
    id: number;
    name: string;
    longName: string;
    alternateName: string | '';
    active: boolean;
    foreColor: string;
    backColor: string;
}
interface Klasse {
    id: number;
    name: string;
    longName: string;
    active: boolean;
}
interface Department {
    id: number;
    name: string;
    longName: string;
}
interface Holiday {
    name: string;
    longName: string;
    id: number;
    startDate: number;
    endDate: number;
}
interface ColorEntity {
    foreColor: string;
    backColor: string;
}
interface LsEntity {
    ls?: ColorEntity | null;
    oh?: ColorEntity | null;
    sb?: ColorEntity | null;
    bs?: ColorEntity | null;
    ex?: ColorEntity | null;
}
interface CodesEntity {
    cancelled?: ColorEntity | null;
    irregular?: ColorEntity | null;
}
interface StatusData {
    lstypes: LsEntity[];
    codes: CodesEntity[];
}
interface Absences {
    absences: Absence[];
    absenceReasons: [];
    excuseStatuses: boolean;
    showAbsenceReasonChange: boolean;
    showCreateAbsence: boolean;
}
interface Absence {
    id: number;
    startDate: number;
    endDate: number;
    startTime: number;
    endTime: number;
    createDate: number;
    lastUpdate: number;
    createdUser: string;
    updatedUser: string;
    reasonId: number;
    reason: string;
    text: string;
    interruptions: [];
    canEdit: boolean;
    studentName: string;
    excuseStatus: string;
    isExcused: boolean;
    excuse: Excuse;
}
interface Excuse {
    id: number;
    text: string;
    excuseDate: number;
    excuseStatus: string;
    isExcused: boolean;
    userId: number;
    username: string;
}

type SessionInformation = {
    klasseId?: number;
    personId?: number;
    sessionId?: string;
    personType?: number;
    jwt_token?: string;
};

declare class Base {
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
    static TYPES: typeof WebUntisElementType;
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
    constructor(school: string, username: string, password: string, baseurl: string, identity?: string, disableUserAgent?: boolean);
    /**
     * Logout the current session
     */
    logout(): Promise<boolean>;
    /**
     * Login with your credentials
     *
     * **Notice: The server may revoke this session after less than 10min of idle.**
     *
     * *Untis says in the official docs:*
     * > An application should always log out as soon as possible to free system resources on the server.
     */
    login(): Promise<SessionInformation>;
    /**
     * Get the latest WebUntis Schoolyear
     * @param {Boolean} [validateSession=true]
     */
    getLatestSchoolyear(validateSession?: boolean): Promise<SchoolYear>;
    /**
     * Get all WebUntis Schoolyears
     * @param {Boolean} [validateSession=true]
     */
    getSchoolyears(validateSession?: boolean): Promise<SchoolYear[]>;
    /**
     * Get News Widget
     * @param {Date} date
     * @param {boolean} [validateSession=true]
     * @returns {Promise<Object>} see index.d.ts NewsWidget
     */
    getNewsWidget(date: Date, validateSession?: boolean): Promise<NewsWidget>;
    /**
     * Get Inbox
     */
    getInbox(validateSession?: boolean): Promise<Inbox>;
    private _checkAnonymous;
    /**
     *
     * @returns {string}
     * @private
     */
    _buildCookies(): string;
    /**
     * Get JWT Token
     * @private
     */
    _getJWT(validateSession?: boolean): Promise<string>;
    /**
     * Checks if your current WebUntis Session is valid
     */
    validateSession(): Promise<boolean>;
    /**
     * Get the time when WebUntis last changed its data
     * @param {Boolean} [validateSession=true]
     */
    getLatestImportTime(validateSession?: boolean): Promise<number>;
    /**
     *
     * @param id
     * @param type
     * @param startDate
     * @param endDate
     * @param validateSession
     * @private
     */
    private _timetableRequest;
    /**
     * Get your own Timetable for the current day
     * Note: You can't use this with anonymous login
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    getOwnTimetableForToday(validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the timetable of today for a specific element.
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    getTimetableForToday(id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get your own Timetable for the given day
     * Note: You can't use this with anonymous login
     * @param {Date} date
     * @param {Boolean} [validateSession=true]
     */
    getOwnTimetableFor(date: Date, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the timetable for a specific day for a specific element.
     * @param {Date} date
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     */
    getTimetableFor(date: Date, id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get your own timetable for a given Date range
     * Note: You can't use this with anonymous login
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getOwnTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the timetable for a given Date range for specific element
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {number} id
     * @param {WebUntisElementType} type
     * @param {Boolean} [validateSession=true]
     */
    getTimetableForRange(rangeStart: Date, rangeEnd: Date, id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the Timetable of your class for today
     * Note: You can't use this with anonymous login
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<Array>}
     */
    getOwnClassTimetableForToday(validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the Timetable of your class for the given day
     * Note: You can't use this with anonymous login
     * @param {Date} date
     * @param {Boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getOwnClassTimetableFor(date: Date, validateSession?: boolean): Promise<Lesson[]>;
    /**
     * Get the Timetable of your class for a given Date range
     * Note: You can't use this with anonymous login
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     */
    getOwnClassTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Lesson[]>;
    /**
     *
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getHomeWorksFor(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Homework[]>;
    /**
     * Converts the untis date string format to a normal JS Date object
     * @param {string} date Untis date string
     * @param {Date} [baseDate=new Date()] Base date. Default beginning of current day
     * @static
     */
    static convertUntisDate(date: string, baseDate?: Date): Date;
    /**
     * Convert a untis time string to a JS Date object
     * @param {string|number} time Untis time string
     * @param {Date} [baseDate=new Date()] Day used as base for the time. Default: Current date
     * @static
     */
    static convertUntisTime(time: number | string, baseDate?: Date): Date;
    /**
     * Get all known Subjects for the current logged-in user
     * @param {boolean} [validateSession=true]
     */
    getSubjects(validateSession?: boolean): Promise<Subject[]>;
    /**
     * Get the timegrid of current school
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getTimegrid(validateSession?: boolean): Promise<Timegrid[]>;
    /**
     *
     * TODO: Find out what type this function returns
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<void>}
     */
    getHomeWorkAndLessons(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Array<any>>;
    /**
     * Get Exams for range
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Number} klasseId
     * @param {boolean} withGrades
     * @param {boolean} [validateSession=true]
     */
    getExamsForRange(rangeStart: Date, rangeEnd: Date, klasseId?: number, withGrades?: boolean, validateSession?: boolean): Promise<Array<Exam>>;
    /**
     * Get the timetable for the current week for a specific element from the web client API.
     * @param {Date} date one date in the week to query
     * @param {number} id element id
     * @param {WebUntisElementType} type element type
     * @param {Number} [formatId=1] set to 1 to include teachers, 2 omits the teachers in elements response
     * @param {Boolean} [validateSession=true]
     */
    getTimetableForWeek(date: Date, id: number, type: number, formatId?: number, validateSession?: boolean): Promise<WebAPITimetable[]>;
    /**
     * Get the timetable for the current week for the current element from the web client API.
     * @param {Date} date one date in the week to query
     * @param {Number} [formatId=1] set to 1 to include teachers, 2 omits the teachers in elements response
     * @param {Boolean} [validateSession=true]
     * @returns {Promise<WebAPITimetable[]>}
     */
    getOwnTimetableForWeek(date: Date, formatId?: number, validateSession?: boolean): Promise<WebAPITimetable[]>;
    /**
     * Get all known teachers by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getTeachers(validateSession?: boolean): Promise<Teacher[]>;
    /**
     * Get all known students by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getStudents(validateSession?: boolean): Promise<Student[]>;
    /**
     * Get all known rooms by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getRooms(validateSession?: boolean): Promise<Room[]>;
    /**
     * Get all classes known by WebUntis
     * @param {boolean} [validateSession=true]
     * @param {number} schoolyearId
     * @returns {Promise.<Array>}
     */
    getClasses(validateSession: boolean | undefined, schoolyearId: number): Promise<Klasse[]>;
    /**
     * Get all departments known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getDepartments(validateSession?: boolean): Promise<Department[]>;
    /**
     * Get all holidays known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getHolidays(validateSession?: boolean): Promise<Holiday[]>;
    /**
     * Get all status data known by WebUntis
     * @param {boolean} [validateSession=true]
     * @returns {Promise.<Array>}
     */
    getStatusData(validateSession?: boolean): Promise<StatusData>;
    /**
     * Convert a JS Date Object to a WebUntis date string
     * @param {Date} date
     * @returns {String}
     */
    static convertDateToUntis(date: Date): string;
    /**
     * Make a JSON RPC Request with the current session
     * @param {string} method
     * @param {Object} [parameter={}]
     * @param {string} [url='/WebUntis/jsonrpc.do?school=SCHOOL']
     * @param {boolean} [validateSession=true] Whether the session should be checked first
     * @returns {Promise.<any>}
     * @private
     */
    _request<Response = Record<string, any>>(method: string, parameter?: Record<string, any>, validateSession?: boolean, url?: string): Promise<Response>;
    /**
     * Returns all the Lessons where you were absent including the excused one!
     * @param {Date} rangeStart
     * @param {Date} rangeEnd
     * @param {Integer} [excuseStatusId=-1]
     * @param {boolean} [validateSession=true]
     * @returns {Promise<Absences>}
     */
    getAbsentLesson(rangeStart: Date, rangeEnd: Date, excuseStatusId?: number, validateSession?: boolean): Promise<Absences>;
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
    getPdfOfAbsentLesson(rangeStart: Date, rangeEnd: Date, validateSession?: boolean, excuseStatusId?: number, lateness?: boolean, absences?: boolean, excuseGroup?: number): Promise<string>;
}
/**
 * @private
 */
declare class InternalWebuntisSecretLogin extends Base {
    constructor(school: string, username: string, password: string, baseurl: string, identity?: string, disableUserAgent?: boolean);
    _otpLogin(token: number | string, username: string, time: number, skipSessionInfo?: boolean): Promise<SessionInformation>;
    /**
     *
     * @param {Array} setCookieArray
     * @param {string} [cookieName="JSESSIONID"]
     * @return {string|boolean}
     * @private
     */
    _getCookieFromSetCookie(setCookieArray?: string[], cookieName?: string): string | undefined;
}

type Authenticator = typeof authenticator;
declare class WebUntisSecretAuth extends InternalWebuntisSecretLogin {
    private readonly secret;
    private authenticator;
    /**
     *
     * @constructor
     * @augments WebUntis
     * @param {string} school The school identifier
     * @param {string} user
     * @param {string} secret
     * @param {string} baseurl Just the host name of your WebUntis (Example: mese.webuntis.com)
     * @param {string} [identity="Awesome"] A identity like: MyAwesomeApp
     * @param {Object} authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(school: string, user: string, secret: string, baseurl: string, identity: string | undefined, authenticator: Authenticator, disableUserAgent?: boolean);
    login(): Promise<SessionInformation>;
}

/**
 * @private
 */
type URLClass = typeof URL;
declare class WebUntisQR extends WebUntisSecretAuth {
    /**
     * Use the data you get from a WebUntis QR code
     * @constructor
     * @param {string} QRCodeURI A WebUntis uri. This is the data you get from the QR Code from the webuntis webapp under profile->Data access->Display
     * @param {string} [identity="Awesome"]  A identity like: MyAwesomeApp
     * @param {Object} authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
     * @param {Object} URL Custom whatwg url implementation. Default will use the nodejs implementation.
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(QRCodeURI: string, identity: string, authenticator: Authenticator, URL?: URLClass, disableUserAgent?: boolean);
}

declare class WebUntisAnonymousAuth extends InternalWebuntisSecretLogin {
    /**
     *
     * @param {string} school
     * @param {string} baseurl
     * @param {string} [identity='Awesome']
     * @param {boolean} [disableUserAgent=false] If this is true, axios will not send a custom User-Agent
     */
    constructor(school: string, baseurl: string, identity?: string, disableUserAgent?: boolean);
    login(): Promise<SessionInformation>;
}

export { Absence, Absences, Authenticator, Base, CodesEntity, ColorEntity, Department, Exam, Excuse, Holiday, Homework, Inbox, Inboxmessage, InternalWebuntisSecretLogin, Klasse, Lesson, LsEntity, MessagesOfDay, Messagesender, NewsWidget, Room, SchoolYear, ShortData, StatusData, Student, Subject, Teacher, TimeUnit, Timegrid, URLClass, WebAPITimetable, WebElement, WebElementData, Base as WebUntis, WebUntisAnonymousAuth, WebUntisDay, WebUntisElementType, WebUntisQR, WebUntisSecretAuth };
