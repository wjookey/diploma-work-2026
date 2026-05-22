const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const lessonsControllerPath = require.resolve('../../src/controllers/lessons.controller');
const lessonModelPath = require.resolve('../../src/model/lesson');

let controller;

const loadController = () => {
    delete require.cache[lessonModelPath];
    delete require.cache[lessonsControllerPath];
    return require('../../src/controllers/lessons.controller');
};

describe('lessons.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sampleLessons = [{ id: 1, status: 'SCHEDULED' }];

        it('returns paginated lessons for admin', async () => {
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue(sampleLessons);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(1);

            await controller.getAll(
                createReq({ user: { role: 'ADMIN' }, query: {} }),
                res,
                next
            );

            expect(prisma.lesson.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sampleLessons,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by clubId, status and date range', async () => {
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);

            const dateFrom = '2025-05-01';
            const dateTo = '2025-05-10';

            await controller.getAll(
                createReq({
                    user: { role: 'ADMIN' },
                    query: { clubId: '3', status: 'SCHEDULED', dateFrom, dateTo },
                }),
                res,
                next
            );

            const callWhere = prisma.lesson.findMany.mock.calls[0][0].where;
            expect(callWhere.clubId).toBe(3);
            expect(callWhere.status).toBe('SCHEDULED');
            expect(callWhere.date.gte).toEqual(new Date(dateFrom));
            expect(callWhere.date.lt).toEqual(
                new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
            );
        });

        it('restricts lessons to parent children active club subscriptions', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([{ id: 1 }, { id: 2 }]);
            vi.spyOn(prisma.subscription, 'findMany').mockResolvedValue([
                { clubId: 5 },
                { clubId: 7 },
            ]);
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ user: { role: 'PARENT', parent: { familyId: 10 } }, query: {} }),
                res,
                next
            );

            expect(prisma.child.findMany).toHaveBeenCalledWith({
                where: { familyId: 10 },
                select: { id: true },
            });
            expect(prisma.subscription.findMany).toHaveBeenCalledWith({
                where: {
                    childId: { in: [1, 2] },
                    status: 'ACTIVE',
                },
                select: { clubId: true, startDate: true, endDate: true },
            });
            expect(prisma.lesson.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { clubId: { in: [5, 7] } },
                })
            );
        });

        it('does not add clubId filter for parent without active subscriptions', async () => {
            vi.spyOn(prisma.child, 'findMany').mockResolvedValue([{ id: 1 }]);
            vi.spyOn(prisma.subscription, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ user: { role: 'PARENT', parent: { familyId: 10 } }, query: {} }),
                res,
                next
            );

            expect(prisma.lesson.findMany.mock.calls[0][0].where.clubId).toBeUndefined();
        });

        it('filters lessons for teacher by assignment or day classes', async () => {
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ user: { role: 'TEACHER', teacher: { id: 4 } }, query: {} }),
                res,
                next
            );

            expect(prisma.lesson.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        OR: [
                            { assignedTeacherId: 4 },
                            { club: { dayClasses: true } },
                        ],
                    },
                })
            );
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.lesson, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);

            await controller.getAll(createReq({ user: { role: 'ADMIN' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const lesson = { id: 6, club: { name: 'Кружок' } };

        it('returns lesson when found', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(lesson);

            await controller.getById(
                createReq({ params: { id: '6' } }),
                res,
                next
            );

            expect(prisma.lesson.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 6 } })
            );
            expect(res.body).toEqual({ success: true, data: lesson });
        });

        it('returns 404 when lesson is missing', async () => {
            vi.spyOn(prisma.lesson, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Урок не найден', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        const club = { id: 3, name: 'Плавание', defaultTeacherId: 8 };
        const created = { id: 10, clubId: 3, status: 'SCHEDULED' };

        const createBody = {
            clubId: '3',
            date: '2025-05-22',
            startTime: '10:00',
            endTime: '11:00',
            room: 'Зал 1',
            topic: 'Тема',
        };

        it('creates lesson with explicit assignedTeacherId', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.lesson, 'create').mockResolvedValue(created);

            await controller.create(
                createReq({ body: { ...createBody, assignedTeacherId: '5' } }),
                res,
                next
            );

            expect(prisma.lesson.create).toHaveBeenCalledWith({
                data: {
                    clubId: 3,
                    date: new Date('2025-05-22'),
                    startTime: '10:00',
                    endTime: '11:00',
                    room: 'Зал 1',
                    topic: 'Тема',
                    status: 'SCHEDULED',
                    assignedTeacherId: 5,
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
        });

        it('uses club defaultTeacherId when assignedTeacherId is omitted', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.lesson, 'create').mockResolvedValue(created);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.lesson.create.mock.calls[0][0].data.assignedTeacherId).toBe(8);
        });

        it('returns 404 when club is missing', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(null);
            const createSpy = vi.spyOn(prisma.lesson, 'create');

            await controller.create(createReq({ body: createBody }), res, next);

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Кружок не найден', statusCode: 404 })
            );
        });
    });

    describe('createWeekLessons', () => {
        const club = { id: 3, defaultTeacherId: 8 };

        it('creates lessons from nested week schedule', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.lesson, 'createMany').mockResolvedValue({ count: 2 });

            await controller.createWeekLessons(
                createReq({
                    body: {
                        weekSchedule: [
                            [
                                {
                                    clubId: '3',
                                    date: '2025-05-19',
                                    startTime: '10:00',
                                    endTime: '11:00',
                                    room: 'A1',
                                    topic: 'Урок 1',
                                },
                            ],
                            [
                                {
                                    clubId: '3',
                                    date: '2025-05-20',
                                    startTime: '12:00',
                                    endTime: '13:00',
                                    assignedTeacherId: '5',
                                },
                            ],
                        ],
                    },
                }),
                res,
                next
            );

            expect(prisma.lesson.createMany).toHaveBeenCalledWith({
                data: [
                    expect.objectContaining({
                        clubId: 3,
                        startTime: '10:00',
                        assignedTeacherId: 8,
                    }),
                    expect.objectContaining({
                        clubId: 3,
                        startTime: '12:00',
                        assignedTeacherId: 5,
                    }),
                ],
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({
                success: true,
                message: '2 is created',
                data: 2,
            });
        });

        it('returns 404 when club in schedule is missing', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(null);
            const createManySpy = vi.spyOn(prisma.lesson, 'createMany');

            await controller.createWeekLessons(
                createReq({
                    body: {
                        weekSchedule: [[{ clubId: '99', date: '2025-05-19', startTime: '10:00', endTime: '11:00' }]],
                    },
                }),
                res,
                next
            );

            expect(createManySpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Кружок не найден', statusCode: 404 })
            );
        });
    });

    describe('update', () => {
        it('updates provided lesson fields', async () => {
            const updated = { id: 4, topic: 'Новая тема' };
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '4' },
                    body: {
                        startTime: '14:00',
                        endTime: '15:00',
                        topic: 'Новая тема',
                        room: '',
                    },
                }),
                res,
                next
            );

            expect(prisma.lesson.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: {
                    startTime: '14:00',
                    endTime: '15:00',
                    topic: 'Новая тема',
                    room: '',
                    assignedTeacherId: null,
                },
                include: expect.any(Object),
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('forwards update errors to next', async () => {
            const err = new Error('update failed');
            vi.spyOn(prisma.lesson, 'update').mockRejectedValue(err);

            await controller.update(
                createReq({ params: { id: '4' }, body: { topic: 'X' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('updateStatus', () => {
        it('updates lesson status', async () => {
            vi.spyOn(prisma.lesson, 'update').mockResolvedValue({ id: 4, status: 'COMPLETED' });

            await controller.updateStatus(
                createReq({ params: { id: '4' }, body: { status: 'COMPLETED' } }),
                res,
                next
            );

            expect(prisma.lesson.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { status: 'COMPLETED' },
            });
            expect(res.body).toEqual({ success: true, message: 'Status is updated' });
        });
    });

    describe('remove', () => {
        it('deletes lesson and returns success message', async () => {
            vi.spyOn(prisma.lesson, 'delete').mockResolvedValue({ id: 9 });

            await controller.remove(
                createReq({ params: { id: '9' } }),
                res,
                next
            );

            expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: 9 } });
            expect(res.body).toEqual({ success: true, message: 'Lesson is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.lesson, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '9' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
