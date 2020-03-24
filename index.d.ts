declare module 'webuntis' {
	export enum WebUntisElementType {
		CLASS = 1,
		TEACHER = 2,
		SUBJECT = 3,
		ROOM = 4,
		STUDENT = 5,
	}

	export interface NewsWidget {
		systemMessage: any;
		messagesOfDay: MessagesOfDay[];
		rssUrl: string;
	}

	export interface MessagesOfDay {
		id: number;
		subject: string;
		text: string;
		isExpanded: boolean;
		attachments: any[];
	}

	export interface LoginSessionInformations {
		sessionId: string;
		personType?: number;
		personId?: number;
		klasseId?: number;
	}
	export interface SchoolYear {
		name: string;
		id: number;
		startDate: Date;
		endDate: Date;
	}

	export interface ShortData {
		id: number;
		name: string;
		longname: string;
	}

	export interface Lesson {
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

	export interface Homework {
		attachments: Array<any>;
		completed: boolean;
		date: number;
		dueDate: number;
		id: number;
		lessonId: number;
		remark: string;
		text: string;
	}

	export interface Subject {
		id: number;
		name: string;
		longName: string;
		alternateName: string | '';
		active: boolean;
		foreColor: string;
		backColor: string;
	}

	export interface Klasse {
		id: number;
		name: string;
		longName: string;
		active: boolean;
	}

	export interface Holiday {
		name: string;
		longName: string;
		id: number;
		startDate: Date;
		endDate: Date;
	}

	export interface Room {
		id: number;
		name: string;
		longName: string;
		alternateName: string | '';
		active: boolean;
		foreColor: string;
		backColor: string;
	}

	export interface TimeUnit {
		name: string;
		startTime: number;
		endTime: number;
	}

	export enum WebUntisDay {
		Sunday = 1,
		Monday = 2,
		Tuesday = 3,
		Wednesday = 4,
		Thursday = 5,
		Friday = 6,
		Saturday = 7
	}

	export interface Timegrid {
		day: WebUntisDay;
		timeUnits: TimeUnit[];
	}

	export default class WebUntis {
		/**
		 *
		 * @param school Name of the school
		 * @param username Your webuntis username
		 * @param password Your webuntis password
		 * @param baseurl The WebUntis Host. Example: XXX.webuntis.com
		 * @param identity The client identity
		 * @constructor
		 */
		constructor(
			school: string,
			username: string,
			password: string,
			baseurl: string,
			identity?: string
		);

		logout(): Promise<boolean>;

		login(): Promise<LoginSessionInformations>;

		getLatestSchoolyear(validateSession?: boolean): Promise<SchoolYear>;

		getNewsWidget(
			date: Date,
			validateSession?: boolean
		): Promise<NewsWidget>;

		private _buildCookies(): Promise<string>;

		private _checkAnonymous(): void;

		validateSession(): Promise<boolean>;

		getLatestImportTime(validateSession?: boolean): Promise<number>;

		getOwnTimetableForToday(validateSession?: boolean): Promise<Lesson[]>;

		getTimetableForToday(id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;

		getOwnTimetableFor(
			date: Date,
			validateSession?: boolean
		): Promise<Lesson[]>;

		getTimetableFor(date: Date, id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;

		getOwnTimetableForRange(
			rangeStart: Date,
			rangeEnd: Date,
			validateSession?: boolean
		): Promise<Lesson[]>;

		getTimetableForRange(
			rangeStart: Date,
			rangeEnd: Date,
			id: number,
			type: number,
			validateSession?: boolean
		): Promise<Lesson[]>;

		getOwnClassTimetableForToday(
			validateSession?: boolean
		): Promise<Lesson[]>;

		getOwnClassTimetableFor(
			date: Date,
			validateSession?: boolean
		): Promise<Lesson[]>;

		getOwnClassTimetableForRange(
			rangeStart: Date,
			rangeEnd: Date,
			validateSession?: boolean
		): Promise<Lesson[]>;

		getHomeWorksFor(
			rangeStart: Date,
			rangeEnd: Date,
			validateSession?: boolean
		): Promise<Homework[]>;

		getSubjects(validateSession?: boolean): Promise<Subject[]>;

		getTimegrid(validateSession?: boolean): Promise<Timegrid[]>;

		getHomeWorkAndLessons(
			rangeStart: Date,
			rangeEnd: Date,
			validateSession?: boolean
		): Promise<Array<any>>;

		getRooms(validateSession?: boolean): Promise<Room[]>;

		getClasses(validateSession?: boolean): Promise<Klasse[]>;

		getHolidays(validateSession?: boolean): Promise<Holiday[]>;

		convertDateToUntis(date: Date): string;

		static convertUntisDate(date: string | number, baseDate?: Date): Date;

		static convertUntisTime(time: string | number, baseDate?: Date): Date;

		static WebUntisAnonymousAuth: typeof WebUntisAnonymousAuth;

		static WebUntisSecretAuth: typeof WebUntisSecretAuth;

		static WebUntisQR: typeof WebUntisQR;

		static TYPES: typeof WebUntisElementType;

		private _request(
			method: string,
			parameter: any,
			validateSession?: boolean,
			url?: string
		): Promise<any>;
	}

	class InternalWebuntisSecretLogin extends WebUntis {}

	export class WebUntisAnonymousAuth extends InternalWebuntisSecretLogin {

	}

	export class WebUntisSecretAuth extends WebUntis {
		/**
		 *
		 * @param school Name of the school
		 * @param username Your webuntis username
		 * @param secret Your secret (Not password)
		 * @param baseurl The WebUntis Host. Example: XXX.webuntis.com
		 * @param identity The client identity
		 * @augments WebUntis
		 * @constructor
		 */
		constructor(
			school: string,
			user: string,
			secret: string,
			baseurl: string,
			identity?: string
		);

		private _getCookieFromSetCookie(
			setCookieArray: Array<any>,
			cookieName?: string
		): Promise<string | boolean>;
	}

	export class WebUntisQR extends WebUntisSecretAuth {
		/**
		 *
		 * @param QRCodeURI The content of the qr code.
		 * @param identity The client identity
		 * @augments WebUntisSecretAuth
		 * @constructor
		 */
		constructor(QRCodeURI: string, identity?: string);
	}
}
