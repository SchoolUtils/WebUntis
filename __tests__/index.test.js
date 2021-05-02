const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
const cases = require('jest-in-case');
const WebUntis = require('../index');

const mockAxios = new MockAdapter(axios);
const mockResponse = {
    result: {
        sessionId: '123',
        personId: 'testing-person',
        personType: 'testing-type',
        klasseId: 'testing-klasse',
    },
};
const school = 'school';
const baseURL = `/WebUntis/jsonrpc.do`;

const getElementObject = (id = mockResponse.result.personId, type = mockResponse.result.personType) => ({
    params: {
        options: {
            element: { id, type },
        },
    },
});

const initMocks = () => {
    mockAxios
        .onPost(
            baseURL,
            expect.objectContaining({
                method: 'getLatestImportTime',
            })
        )
        .replyOnce(200, { result: 123 });
};

const createInstance = () => {
    const instance = new WebUntis(school, 'username', 'password', 'xyz.webuntis.com');

    return instance;
};

beforeEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
    initMocks();
});

test('should method login return mock result', async () => {
    const untis = createInstance();

    mockAxios.onPost(baseURL).reply(200, mockResponse);

    expect(await untis.login()).toEqual(mockResponse.result);
});

cases(
    'should method login catch error',
    async ({ response }) => {
        const untis = createInstance();

        mockAxios.onPost(baseURL).reply(200, response);

        await expect(() => untis.login()).rejects.toThrowErrorMatchingSnapshot();
    },
    [
        { name: 'response not object', response: '' },
        { name: 'with result null', response: { result: null } },
        { name: 'with result has code', response: { result: { code: 500 } } },
        { name: 'with empty sessionId', response: { result: {} } },
    ]
);

test('should method logout return true', async () => {
    const untis = createInstance();

    mockAxios.onPost(baseURL).reply(200, { result: {} });

    expect(await untis.logout()).toBe(true);
});

cases(
    'should getLatestSchoolyear return object',
    async ({ validate }) => {
        const name = 'testName';
        const id = 'testId';
        const untis = createInstance();

        mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getSchoolyears' })).replyOnce(200, {
            result: [
                {
                    id,
                    name,
                    startDate: '20191111',
                    endDate: '20191211',
                },
                {
                    id,
                    name,
                    startDate: '20191113',
                    endDate: '20191115',
                },
            ],
        });

        expect(await untis.getLatestSchoolyear(validate)).toEqual({
            name,
            id,
            startDate: new Date('11/13/2019'),
            endDate: new Date('11/15/2019'),
        });
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

test('should getLatestSchoolyear throw error with empty array', async () => {
    const name = 'testName';
    const id = 'testId';
    const untis = createInstance();

    mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getSchoolyears' })).replyOnce(200, {
        result: [],
    });

    await expect(() => untis.getLatestSchoolyear(false)).rejects.toThrowErrorMatchingSnapshot();
});

cases(
    'should getNewsWidget return data',
    async ({ validate }) => {
        const untis = createInstance();
        const response = { testing: 'dataTest' };

        mockAxios.onGet(/newsWidgetData/).replyOnce(200, { data: response });

        expect(await untis.getNewsWidget(new Date('11/13/2019'), validate)).toEqual(response);
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

test('should getNewsWidget catch invalid data', async () => {
    const untis = createInstance();
    const response = { testing: 'dataTest' };

    mockAxios.reset();
    mockAxios
        .onPost(
            baseURL,
            expect.objectContaining({
                method: 'getLatestImportTime',
            })
        )
        .replyOnce(200, { result: 'string' });

    await expect(() => untis.getNewsWidget(new Date('11/13/2019'))).rejects.toThrowErrorMatchingSnapshot();
});

test('should getNewsWidget catch data not object', async () => {
    const untis = createInstance();
    const response = { testing: 'dataTest' };

    mockAxios.onGet(/newsWidgetData/).replyOnce(200, { data: 123 });

    await expect(() => untis.getNewsWidget(new Date('11/13/2019'))).rejects.toThrowErrorMatchingSnapshot();
});

cases(
    'should getLatestImportTime return result',
    async ({ validate }) => {
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getLatestImportTime' }))
            .replyOnce(200, { result: 123 });

        expect(await untis.getLatestImportTime(validate)).toBe(123);
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getOwnTimetableForToday return result',
    async ({ validate, postIndex }) => {
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getTimetable' }))
            .replyOnce(200, { result: 123 })
            .onPost(baseURL)
            .reply(200, mockResponse);

        await untis.login();
        const result = await untis.getOwnTimetableForToday(validate);

        expect(result).toBe(123);
        expect(JSON.parse(mockAxios.history.post[postIndex].data)).toMatchObject(getElementObject());
    },
    [
        { name: 'with validate', postIndex: 2, validate: true },
        { name: 'without validate', postIndex: 1, validate: false },
    ]
);

cases(
    'should getTimetableForToday return result',
    async ({ validate, postIndex }) => {
        const id = 'test-id';
        const type = 'test-type';
        const untis = createInstance();

        mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getTimetable' })).replyOnce(200, { result: 123 });

        expect(await untis.getTimetableForToday(id, type, validate)).toBe(123);
        expect(JSON.parse(mockAxios.history.post[postIndex].data)).toMatchObject(getElementObject(id, type));
    },
    [
        { name: 'with validate', postIndex: 1, validate: true },
        { name: 'without validate', postIndex: 0, validate: false },
    ]
);

cases(
    'should getOwnTimetableFor return result',
    async ({ validate, postIndex }) => {
        const date = new Date('11/13/2019');
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getTimetable' }))
            .replyOnce(200, { result: 123 })
            .onPost(baseURL)
            .reply(200, mockResponse);

        await untis.login();

        expect(await untis.getOwnTimetableFor(date, validate)).toBe(123);
        expect(mockAxios.history.post[postIndex].data).toMatch('20191113');
        expect(JSON.parse(mockAxios.history.post[postIndex].data)).toMatchObject(getElementObject());
    },
    [
        { name: 'with validate', postIndex: 2, validate: true },
        { name: 'without validate', postIndex: 1, validate: false },
    ]
);

cases(
    'should getTimetableFor return result',
    async (validate) => {
        const id = 'test-id';
        const type = 'test-type';
        const date = new Date('11/13/2019');
        const untis = createInstance();

        mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getTimetable' })).replyOnce(200, { result: 123 });

        expect(await untis.getTimetableFor(date, id, type, validate)).toBe(123);
        expect(mockAxios.history.post[1].data).toMatch('20191113');
        expect(JSON.parse(mockAxios.history.post[1].data)).toMatchObject(getElementObject(id, type));
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getOwnTimetableForRange return result',
    async (validate) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getTimetable' })).replyOnce(200, { result: 123 });

        expect(await untis.getOwnTimetableForRange(dateStart, dateEnd, validate)).toBe(123);
        expect(mockAxios.history.post[1].data).toMatch('20191113');
        expect(mockAxios.history.post[1].data).toMatch('20191117');
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getTimetableForRange return result',
    async (validate) => {
        const id = 'test-id';
        const type = 'test-type';
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.onPost(baseURL, expect.objectContaining({ method: 'getTimetable' })).replyOnce(200, { result: 123 });

        expect(await untis.getTimetableForRange(dateStart, dateEnd, id, type, validate)).toBe(123);
        expect(mockAxios.history.post[1].data).toMatch('20191113');
        expect(mockAxios.history.post[1].data).toMatch('20191117');
        expect(JSON.parse(mockAxios.history.post[1].data)).toMatchObject(getElementObject(id, type));
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getOwnClassTimetableForToday return result',
    async (validate) => {
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getTimetable' }))
            .replyOnce(200, { result: 123 })
            .onPost(baseURL)
            .reply(200, mockResponse);

        await untis.login();

        expect(await untis.getOwnClassTimetableForToday(validate)).toBe(123);
        expect(JSON.parse(mockAxios.history.post[2].data)).toMatchObject(
            getElementObject(mockResponse.result.klasseId, 1)
        );
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getOwnClassTimetableFor return result',
    async (validate) => {
        const date = new Date('11/13/2019');
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getTimetable' }))
            .replyOnce(200, { result: 123 })
            .onPost(baseURL)
            .reply(200, mockResponse);

        await untis.login();

        expect(await untis.getOwnClassTimetableFor(date, validate)).toBe(123);
        expect(mockAxios.history.post[2].data).toMatch('20191113');
        expect(JSON.parse(mockAxios.history.post[2].data)).toMatchObject(
            getElementObject(mockResponse.result.klasseId, 1)
        );
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getOwnClassTimetableForRange return result',
    async (validate) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios
            .onPost(baseURL, expect.objectContaining({ method: 'getTimetable' }))
            .replyOnce(200, { result: 123 })
            .onPost(baseURL)
            .reply(200, mockResponse);

        await untis.login();

        expect(await untis.getOwnClassTimetableForRange(dateStart, dateEnd, validate)).toBe(123);
        expect(mockAxios.history.post[2].data).toMatch('20191113');
        expect(mockAxios.history.post[2].data).toMatch('20191117');
        expect(JSON.parse(mockAxios.history.post[2].data)).toMatchObject(
            getElementObject(mockResponse.result.klasseId, 1)
        );
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getHomeWorksFor return result',
    async ({ validate }) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.onGet(/homeworks\/lessons/).replyOnce(200, {
            data: {
                homeworks: {},
            },
        });

        expect(await untis.getHomeWorksFor(dateStart, dateEnd, validate)).toEqual({
            homeworks: {},
        });
        expect(mockAxios.history.get[0].params.startDate).toMatch('20191113');
        expect(mockAxios.history.get[0].params.endDate).toMatch('20191117');
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getHomeWorksFor catch error',
    async ({ validate, response, data }) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.reset();
        mockAxios
            .onPost(baseURL)
            .reply(200, response)
            .onGet(/homeworks\/lessons/)
            .replyOnce(200, { data });

        await expect(() => untis.getHomeWorksFor(dateStart, dateEnd, validate)).rejects.toThrowErrorMatchingSnapshot();
    },
    [
        {
            name: 'validate',
            validate: true,
            data: '',
            response: { result: '' },
        },
        {
            name: 'validate with not object',
            validate: true,
            data: '',
            response: { result: 200 },
        },
        {
            name: 'validate without homeworks',
            validate: true,
            data: {},
            response: { result: 200 },
        },
        {
            name: 'invalidate',
            validate: false,
            data: '',
            response: { result: '' },
        },
        {
            name: 'invalidate with not object',
            validate: false,
            data: '',
            response: { result: 200 },
        },
        {
            name: 'invalidate without homeworks',
            validate: false,
            data: {},
            response: { result: 200 },
        },
    ]
);

test('should convertUntisDate converted date', () => {
    const date = new Date('11/13/2019');
    expect(WebUntis.convertUntisDate(20191113, date)).toEqual(date);
});

test('should convertUntisTime converted time', () => {
    const date = new Date('11/13/2019 3:11');
    expect(WebUntis.convertUntisTime(311, date)).toEqual(date);
});

cases(
    'should method return result',
    async ({ name, method, validate, post }) => {
        const untis = createInstance();

        mockAxios.onPost(baseURL).reply(200, mockResponse);

        expect(await untis[name](validate)).toEqual(mockResponse.result);
        expect(JSON.parse(mockAxios.history.post[post].data)).toMatchObject({
            method,
        });
    },
    [
        { name: 'getSubjects', method: 'getSubjects', validate: true, post: 1 },
        {
            name: 'getSubjects',
            method: 'getSubjects',
            validate: false,
            post: 0,
        },
        { name: 'getTeachers', method: 'getTeachers', validate: true, post: 1 },
        {
            name: 'getTeachers',
            method: 'getTeachers',
            validate: false,
            post: 0,
        },
        { name: 'getStudents', method: 'getStudents', validate: true, post: 1 },
        {
            name: 'getStudents',
            method: 'getStudents',
            validate: false,
            post: 0,
        },
        { name: 'getRooms', method: 'getRooms', validate: true, post: 1 },
        { name: 'getRooms', method: 'getRooms', validate: false, post: 0 },
        { name: 'getClasses', method: 'getKlassen', validate: true, post: 1 },
        { name: 'getClasses', method: 'getKlassen', validate: false, post: 0 },
        {
            name: 'getDepartments',
            method: 'getDepartments',
            validate: true,
            post: 1,
        },
        {
            name: 'getDepartments',
            method: 'getDepartments',
            validate: false,
            post: 0,
        },
        { name: 'getHolidays', method: 'getHolidays', validate: true, post: 1 },
        {
            name: 'getHolidays',
            method: 'getHolidays',
            validate: false,
            post: 0,
        },
        {
            name: 'getStatusData',
            method: 'getStatusData',
            validate: true,
            post: 1,
        },
        {
            name: 'getStatusData',
            method: 'getStatusData',
            validate: false,
            post: 0,
        },
        {
            name: 'getTimegrid',
            method: 'getTimegridUnits',
            validate: true,
            post: 1,
        },
        {
            name: 'getTimegrid',
            method: 'getTimegridUnits',
            validate: false,
            post: 0,
        },
    ]
);

cases(
    'should getHomeWorkAndLessons return result',
    async ({ validate }) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.onGet(/homeworks\/lessons/).replyOnce(200, {
            data: {
                homeworks: {},
            },
        });

        expect(await untis.getHomeWorkAndLessons(dateStart, dateEnd, validate)).toEqual({
            homeworks: {},
        });
        expect(mockAxios.history.get[0].params.startDate).toMatch('20191113');
        expect(mockAxios.history.get[0].params.endDate).toMatch('20191117');
    },
    [
        { name: 'with validate', validate: true },
        { name: 'without validate', validate: false },
    ]
);

cases(
    'should getHomeWorkAndLessons catch error',
    async ({ validate, response, data }) => {
        const dateStart = new Date('11/13/2019');
        const dateEnd = new Date('11/17/2019');
        const untis = createInstance();

        mockAxios.reset();
        mockAxios
            .onPost(baseURL)
            .reply(200, response)
            .onGet(/homeworks\/lessons/)
            .replyOnce(200, { data });

        await expect(() =>
            untis.getHomeWorkAndLessons(dateStart, dateEnd, validate)
        ).rejects.toThrowErrorMatchingSnapshot();
    },
    [
        {
            name: 'validate',
            validate: true,
            data: '',
            response: { result: '' },
        },
        {
            name: 'validate with not object',
            validate: true,
            data: '',
            response: { result: 200 },
        },
        {
            name: 'validate without homeworks',
            validate: true,
            data: {},
            response: { result: 200 },
        },
        {
            name: 'invalidate',
            validate: false,
            data: '',
            response: { result: '' },
        },
        {
            name: 'invalidate with not object',
            validate: false,
            data: '',
            response: { result: 200 },
        },
        {
            name: 'invalidate without homeworks',
            validate: false,
            data: {},
            response: { result: 200 },
        },
    ]
);

cases(
    'should convertDateToUntis converted date',
    ({ date, result }) => {
        const untis = createInstance();
        expect(untis.convertDateToUntis(new Date(date))).toBe(result);
    },
    [
        { name: 'default', date: '11/13/2019', result: '20191113' },
        { name: 'date < 10', date: '11/09/2019', result: '20191109' },
        { name: 'mouth < 10', date: '09/13/2019', result: '20190913' },
        {
            name: 'date < 10 && mouth < 10',
            date: '09/08/2019',
            result: '20190908',
        },
    ]
);
