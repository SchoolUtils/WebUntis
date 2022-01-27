declare module 'webuntis' {
    import { Authenticator } from 'otplib/core';

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

    export interface Exam {
        id: number;
        examType: string;
        name: string;
        studentClass: string[];
        assignedStudents: {
            klasse: { id: number; name: string };
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

    export interface Teacher {
        id: number;
        name: string;
        foreName: string;
        longName: string;
        foreColor: string;
        backColor: string;
    }

    export interface Student {
        id: number;
        key: number;
        name: string;
        foreName: string;
        longName: string;
        gender: string;
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

    export interface Department {
        id: number;
        name: string;
        longName: string;
    }

    export interface Holiday {
        name: string;
        longName: string;
        id: number;
        startDate: Date;
        endDate: Date;
    }

    export interface StatusData {
        lstypes: LsEntity[];
        codes: CodesEntity[];
    }

    export interface LsEntity {
        ls?: ColorEntity | null;
        oh?: ColorEntity | null;
        sb?: ColorEntity | null;
        bs?: ColorEntity | null;
        ex?: ColorEntity | null;
    }

    export interface CodesEntity {
        cancelled?: ColorEntity | null;
        irregular?: ColorEntity | null;
    }

    export interface ColorEntity {
        foreColor: string;
        backColor: string;
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
        Saturday = 7,
    }

    export interface Timegrid {
        day: WebUntisDay;
        timeUnits: TimeUnit[];
    }

    export interface Inbox {
        incomingMessages: Inboxmessage[]
    }

    export interface Inboxmessage {
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

    export interface Messagesender {
        userId: number;
        displayName: string;
        imageUrl: string;
        className: string;
    }        

    export default class WebUntis {
        /**
         *
         * @param school Name of the school
         * @param username Your webuntis username
         * @param password Your webuntis password
         * @param baseurl The WebUntis Host. Example: XXX.webuntis.com
         * @param identity The client identity
         * @param disableUserAgent If this is true, axios will not send a custom User-Agent
         * @constructor
         */
        constructor(
            school: string,
            username: string,
            password: string,
            baseurl: string,
            identity?: string,
            disableUserAgent?: boolean
        );

        logout(): Promise<boolean>;

        login(): Promise<LoginSessionInformations>;

        getLatestSchoolyear(validateSession?: boolean): Promise<SchoolYear>;

        /**
         * @deprecated This method doesn't seem to work anymore.
         * @param date
         * @param validateSession
         */
        getNewsWidget(date: Date, validateSession?: boolean): Promise<NewsWidget>;

        getInbox(validateSession?: boolean): Promise<Inbox>;
        
        private _buildCookies(): Promise<string>;

        private _checkAnonymous(): void;

        validateSession(): Promise<boolean>;

        getLatestImportTime(validateSession?: boolean): Promise<number>;

        getOwnTimetableForToday(validateSession?: boolean): Promise<Lesson[]>;

        getTimetableForToday(id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;

        getOwnTimetableFor(date: Date, validateSession?: boolean): Promise<Lesson[]>;

        getTimetableFor(date: Date, id: number, type: number, validateSession?: boolean): Promise<Lesson[]>;

        getOwnTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Lesson[]>;

        getTimetableForRange(
            rangeStart: Date,
            rangeEnd: Date,
            id: number,
            type: number,
            validateSession?: boolean
        ): Promise<Lesson[]>;

        getOwnClassTimetableForToday(validateSession?: boolean): Promise<Lesson[]>;

        getOwnClassTimetableFor(date: Date, validateSession?: boolean): Promise<Lesson[]>;

        getOwnClassTimetableForRange(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Lesson[]>;

        getHomeWorksFor(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Homework[]>;

        getSubjects(validateSession?: boolean): Promise<Subject[]>;

        getTimegrid(validateSession?: boolean): Promise<Timegrid[]>;

        getHomeWorkAndLessons(rangeStart: Date, rangeEnd: Date, validateSession?: boolean): Promise<Array<any>>;

        getExamsForRange(
            rangeStart: Date,
            rangeEnd: Date,
            klasseId: number,
            withGrades: boolean,
            validateSession?: boolean
        ): Promise<Array<Exam>>;

        getTeachers(validateSession?: boolean): Promise<Teacher[]>;

        getStudents(validateSession?: boolean): Promise<Student[]>;

        getRooms(validateSession?: boolean): Promise<Room[]>;

        getClasses(validateSession?: boolean): Promise<Klasse[]>;

        getDepartments(validateSession?: boolean): Promise<Department[]>;

        getHolidays(validateSession?: boolean): Promise<Holiday[]>;

        getStatusData(validateSession?: boolean): Promise<StatusData>;

        convertDateToUntis(date: Date): string;

        static convertUntisDate(date: string | number, baseDate?: Date): Date;

        static convertUntisTime(time: string | number, baseDate?: Date): Date;

        static WebUntisAnonymousAuth: typeof WebUntisAnonymousAuth;

        static WebUntisSecretAuth: typeof WebUntisSecretAuth;

        static WebUntisQR: typeof WebUntisQR;

        static TYPES: typeof WebUntisElementType;

        private _request(method: string, parameter: any, validateSession?: boolean, url?: string): Promise<any>;
    }

    class InternalWebuntisSecretLogin extends WebUntis {}

    export class WebUntisAnonymousAuth extends InternalWebuntisSecretLogin {
        /**
         *
         * @param school Name of the school
         * @param baseurl The WebUntis Host. Example: XXX.webuntis.com
         * @param identity The client identity
         * @param disableUserAgent If this is true, axios will not send a custom User-Agent
         * @augments WebUntis
         * @constructor
         */
         constructor(
            school: string,
            baseurl: string,
            identity?: string,
            disableUserAgent?: boolean
        );
    }

    export class WebUntisSecretAuth extends WebUntis {
        /**
         *
         * @param school Name of the school
         * @param username Your webuntis username
         * @param secret Your secret (Not password)
         * @param baseurl The WebUntis Host. Example: XXX.webuntis.com
         * @param identity The client identity
         * @param authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
         * @param disableUserAgent If this is true, axios will not send a custom User-Agent
         * @augments WebUntis
         * @constructor
         */
        constructor(
            school: string,
            user: string,
            secret: string,
            baseurl: string,
            identity?: string,
            authenticator?: Authenticator,
            disableUserAgent?: boolean
        );

        private _getCookieFromSetCookie(setCookieArray: Array<any>, cookieName?: string): Promise<string | boolean>;
    }

    export class WebUntisQR extends WebUntisSecretAuth {
        /**
         *
         * @param QRCodeURI The content of the qr code.
         * @param identity The client identity
         * @param authenticator Custom otplib v12 instance. Default will use the default otplib configuration.
         * @param URL Custom whatwg url implementation. Default will use the nodejs implementation.
         * @param disableUserAgent If this is true, axios will not send a custom User-Agent
         * @augments WebUntisSecretAuth
         * @constructor
         */
        constructor(
            QRCodeURI: string,
            identity?: string,
            authenticator?: Authenticator,
            URL?: any,
            disableUserAgent?: boolean
        );
    }
}
