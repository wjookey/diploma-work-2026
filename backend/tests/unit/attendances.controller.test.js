const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const attendancesControllerPath = require.resolve('../../src/controllers/attendances.controller');
const attendanceModelPath = require.resolve('../../src/model/attendance');

let controller;

const loadController = () => {
    delete require.cache[attendanceModelPath];
    delete require.cache[attendancesControllerPath];
    return require('../../src/controllers/attendances.controller');
};

const TODAY = new Date('2025-05-21T14:00:00');

const lessonToday = (overrides = {}) => ({
    id: 1,
    date: new Date('2025-05-21T10:00:00'),
    status: 'SCHEDULED',
    clubId: 5,
    ...overrides,
});

const activeSubscription = (overrides = {}) => ({
    id: 100,
    childId: 1,
    clubId: 5,
    status: 'ACTIVE',
    remainingLessons: 10,
    usedFreezes: 0,
    clubService: { freezedLesson: 2 },
    ...overrides,
});

describe('attendances.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, isPresent: true }];

        it('returns paginated attendances without filters', async () => {
            vi.spyOn(prisma.attendance, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.attendance, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ query: {} }), res, next);

            expect(prisma.attendance.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by childId and familyId', async () => {
            vi.spyOn(prisma.attendance, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.attendance, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ query: { childId: '3', familyId: '7' } }),
                res,
                next
            );

            expect(prisma.attendance.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        childId: 3,
                        child: { familyId: 7 },
                    },
                })
            );
        });

        it('filters by date range on lesson date', async () => {
            vi.spyOn(prisma.attendance, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.attendance, 'count').mockResolvedValue(0);

            const dateFrom = '2025-05-01';
            const dateTo = '2025-05-10';

            await controller.getAll(
                createReq({ query: { dateFrom, dateTo } }),
                res,
                next
            );

            const callWhere = prisma.attendance.findMany.mock.calls[0][0].where;
            expect(callWhere.lesson.date.gte).toEqual(new Date(dateFrom));
            expect(callWhere.lesson.date.lt).toEqual(
                new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.attendance, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.attendance, 'count').mockResolvedValue(30);

            await controller.getAll(
                createReq({ query: { page: '2', limit: '15' } }),
                res,
                next
            );

            expect(prisma.attendance.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 15, take: 15 })
            );
            expect(res.body.pagination).toMatchObject({
                total: 30,
                page: 2,
                limit: 15,
                totalPages: 2,
            });
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.attendance, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.attendance, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getByLesson', () => {
        const lesson = { id: 4, club: { name: 'Клуб' }, attendances: [] };

        it('returns lesson with attendances', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lesson);

            await controller.getByLesson(
                createReq({ params: { lessonId: '4' } }),
                res,
                next
            );

            expect(prisma.lesson.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 4 } })
            );
            expect(res.body).toEqual({ success: true, data: lesson });
        });

        it('calls next with 404 when lesson is missing', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(null);

            await controller.getByLesson(
                createReq({ params: { lessonId: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Урок не найден', statusCode: 404 })
            );
        });
    });

    describe('markAttendance', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        const markBody = {
            lessonId: 1,
            attendances: [{ childId: 1, subId: 100, isPresent: true, note: 'пришёл' }],
        };

        it('returns 403 when lesson is not today', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(
                lessonToday({ date: new Date('2025-05-20T10:00:00') })
            );

            await controller.markAttendance(
                createReq({
                    user: { role: 'TEACHER', teacher: { id: 2 } },
                    body: markBody,
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Посещаемость может быть отмечена только в день проведения занятия',
                    statusCode: 403,
                })
            );
        });

        it('upserts attendance and connects teacher for teacher role', async () => {
            const upserted = { id: 50, isPresent: true };
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lessonToday());
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue(upserted);
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(activeSubscription());
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({
                    user: { role: 'TEACHER', teacher: { id: 2 } },
                    body: markBody,
                }),
                res,
                next
            );

            expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
                where: { id: 100 },
                include: { clubService: true },
            });
            expect(prisma.attendance.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({
                        teacher: { connect: { id: 2 } },
                    }),
                })
            );
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: [upserted] });
        });

        it('disconnects teacher on update when marked by admin', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lessonToday());
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue({
                lessonId: 1,
                childId: 1,
                isPresent: false,
            });
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(activeSubscription());
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({
                    user: { role: 'ADMIN' },
                    body: markBody,
                }),
                res,
                next
            );

            expect(prisma.attendance.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({
                        teacher: { disconnect: true },
                    }),
                })
            );
        });

        it('decrements remainingLessons when child is present on scheduled lesson', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lessonToday());
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(
                activeSubscription({ remainingLessons: 5 })
            );
            const subscriptionUpdate = vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({
                    user: { role: 'ADMIN' },
                    body: markBody,
                }),
                res,
                next
            );

            expect(subscriptionUpdate).toHaveBeenCalledWith({
                where: { id: 100 },
                data: expect.objectContaining({ remainingLessons: 4 }),
            });
        });

        it('increments usedFreezes when child is absent and freezes available', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lessonToday());
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(
                activeSubscription({ usedFreezes: 0 })
            );
            const subscriptionUpdate = vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({
                    user: { role: 'ADMIN' },
                    body: {
                        lessonId: 1,
                        attendances: [{ childId: 1, subId: 100, isPresent: false }],
                    },
                }),
                res,
                next
            );

            expect(subscriptionUpdate).toHaveBeenCalledWith({
                where: { id: 100 },
                data: expect.objectContaining({ usedFreezes: 1 }),
            });
        });

        it('marks lesson as completed after marking scheduled lesson', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lessonToday());
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(activeSubscription());
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            const lessonUpdate = vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({ user: { role: 'ADMIN' }, body: markBody }),
                res,
                next
            );

            expect(lessonUpdate).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { status: 'COMPLETED' },
            });
        });

        it('restores lessons on completed lesson when present becomes absent', async () => {
            const lesson = lessonToday({ status: 'COMPLETED' });
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lesson);
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue({
                lessonId: 1,
                childId: 1,
                isPresent: true,
            });
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({
                id: 100,
                status: 'EXPIRED',
                remainingLessons: 0,
                usedFreezes: 0,
                clubService: { freezedLesson: 2 },
            });
            const subscriptionUpdate = vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({
                    user: { role: 'ADMIN' },
                    body: {
                        lessonId: 1,
                        attendances: [{ childId: 1, isPresent: false }],
                    },
                }),
                res,
                next
            );

            expect(subscriptionUpdate).toHaveBeenCalledWith({
                where: { id: 100 },
                data: {
                    remainingLessons: 1,
                    usedFreezes: 1,
                    status: 'ACTIVE',
                },
            });
        });

        it('does not mark lesson completed when lesson is already completed', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(
                lessonToday({ status: 'COMPLETED' })
            );
            vi.spyOn(prisma.attendance, 'findUnique').mockResolvedValue({
                lessonId: 1,
                childId: 1,
                isPresent: true,
            });
            vi.spyOn(prisma.attendance, 'upsert').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
            const lessonUpdate = vi.spyOn(prisma.lesson, 'update').mockResolvedValue({});

            await controller.markAttendance(
                createReq({ user: { role: 'ADMIN' }, body: markBody }),
                res,
                next
            );

            expect(lessonUpdate).not.toHaveBeenCalled();
        });

        it('forwards errors to next', async () => {
            const err = new Error('mark failed');
            vi.spyOn(prisma.lesson, 'findUnique').mockRejectedValue(err);

            await controller.markAttendance(
                createReq({ user: { role: 'ADMIN' }, body: markBody }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
