export interface SchoolYear {
    name: string;
    id: number;
    startDate: Date;
    endDate: Date;
}

export interface MessagesOfDay {
    id: number;
    subject: string;
    text: string;
    isExpanded: boolean;
    /**
     * Unknown type. I have never seen this in use.
     */
    attachments: any[];
}

export interface NewsWidget {
    /**
     * Unknown type. I have never seen this in use.
     */
    systemMessage: any;
    messagesOfDay: MessagesOfDay[];
    rssUrl: string;
}

export interface Messagesender {
    userId: number;
    displayName: string;
    imageUrl: string;
    className: string;
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

export interface Inbox {
    incomingMessages: Inboxmessage[];
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

export interface Subject {
    id: number;
    name: string;
    longName: string;
    alternateName: string | '';
    active: boolean;
    foreColor: string;
    backColor: string;
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

export interface TimeUnit {
    name: string;
    startTime: number;
    endTime: number;
}

export interface Timegrid {
    day: WebUntisDay;
    timeUnits: TimeUnit[];
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

export enum WebUntisElementType {
    CLASS = 1,
    TEACHER = 2,
    SUBJECT = 3,
    ROOM = 4,
    STUDENT = 5,
}

export interface WebElement {
    type: WebUntisElementType;
    id: number;
    orgId: number;
    missing: boolean;
    state: 'REGULAR' | 'ABSENT' | 'SUBSTITUTED';
}

export interface WebElementData extends WebElement {
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

export interface WebAPITimetable {
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

export interface Room {
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
    startDate: number;
    endDate: number;
}

export interface ColorEntity {
    foreColor: string;
    backColor: string;
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

export interface StatusData {
    lstypes: LsEntity[];
    codes: CodesEntity[];
}

export interface Absences {
    absences: Absence[];
    absenceReasons: [];
    excuseStatuses: boolean;
    showAbsenceReasonChange: boolean;
    showCreateAbsence: boolean;
}

export interface Absence {
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

export interface Excuse {
    id: number;
    text: string;
    excuseDate: number;
    excuseStatus: string;
    isExcused: boolean;
    userId: number;
    username: string;
}
