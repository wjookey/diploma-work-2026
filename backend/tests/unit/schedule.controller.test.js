const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const scheduleControllerPath = require.resolve('../../src/controllers/schedule.controller');
const scheduleModelPath = require.resolve('../../src/model/schedule');

let controller;

const loadController = () => {
    delete require.cache[scheduleModelPath];
    delete require.cache[scheduleControllerPath];
    return require('../../src/controllers/schedule.controller');
};

describe('schedule.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, dayOfWeek: 1, startTime: '10:00' }];

        it('returns all schedule entries', async () => {
            vi.spyOn(prisma.schedule, 'findMany').mockResolvedValue(sample);

            await controller.getAll(createReq(), res, next);

            expect(prisma.schedule.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
                })
            );
            expect(res.body).toEqual({ success: true, data: sample });
            expect(next).not.toHaveBeenCalled();
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.schedule, 'findMany').mockRejectedValue(err);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const entry = { id: 3, dayOfWeek: 2, club: { name: 'Кружок' } };

        it('returns schedule entry by id', async () => {
            vi.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(entry);

            await controller.getById(
                createReq({ params: { id: '3' } }),
                res,
                next
            );

            expect(prisma.schedule.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 3 } })
            );
            expect(res.body).toEqual({ success: true, data: entry });
        });

        it('returns null data when entry is not found', async () => {
            vi.spyOn(prisma.schedule, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(res.body).toEqual({ success: true, data: null });
        });
    });

    describe('create', () => {
        const club = { id: 5, name: 'Плавание', teacher: { id: 2 } };
        const created = {
            id: 10,
            clubId: 5,
            dayOfWeek: 1,
            startTime: '10:00',
            endTime: '11:00',
            room: 'Зал 1',
            club,
        };

        const createBody = {
            clubId: '5',
            dayOfWeek: 1,
            startTime: '10:00',
            endTime: '11:00',
            room: 'Зал 1',
        };

        it('creates schedule entry when club exists', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.schedule, 'create').mockResolvedValue(created);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.club.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } })
            );
            expect(prisma.schedule.create).toHaveBeenCalledWith({
                data: {
                    clubId: 5,
                    dayOfWeek: 1,
                    startTime: '10:00',
                    endTime: '11:00',
                    room: 'Зал 1',
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });

        it('returns 404 when club is missing', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(null);
            const createSpy = vi.spyOn(prisma.schedule, 'create');

            await controller.create(createReq({ body: createBody }), res, next);

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Кружок не найден', statusCode: 404 })
            );
        });
    });

    describe('update', () => {
        it('updates provided fields', async () => {
            const updated = { id: 4, dayOfWeek: 3, room: 'Зал 2' };
            vi.spyOn(prisma.schedule, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '4' },
                    body: { dayOfWeek: 3, room: 'Зал 2' },
                }),
                res,
                next
            );

            expect(prisma.schedule.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { dayOfWeek: 3, room: 'Зал 2' },
                include: expect.any(Object),
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('allows clearing room with empty string', async () => {
            vi.spyOn(prisma.schedule, 'update').mockResolvedValue({ id: 4, room: '' });

            await controller.update(
                createReq({ params: { id: '4' }, body: { room: '' } }),
                res,
                next
            );

            expect(prisma.schedule.update.mock.calls[0][0].data).toEqual({ room: '' });
        });

        it('forwards update errors to next', async () => {
            const err = new Error('update failed');
            vi.spyOn(prisma.schedule, 'update').mockRejectedValue(err);

            await controller.update(
                createReq({ params: { id: '4' }, body: { startTime: '12:00' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('remove', () => {
        it('deletes schedule entry and returns success message', async () => {
            vi.spyOn(prisma.schedule, 'delete').mockResolvedValue({ id: 6 });

            await controller.remove(
                createReq({ params: { id: '6' } }),
                res,
                next
            );

            expect(prisma.schedule.delete).toHaveBeenCalledWith({ where: { id: 6 } });
            expect(res.body).toEqual({ success: true, message: 'Schedule is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.schedule, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '6' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('generateLessons', () => {
        const scheduleEntry = {
            clubId: 1,
            dayOfWeek: 1,
            startTime: '10:00',
            endTime: '11:00',
            room: 'Зал 1',
            club: { defaultTeacherId: 7 },
        };

        it('returns 400 when start date is after end date', async () => {
            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-25', endDate: '2025-05-20' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Дата начала должна быть раньше даты конца',
                    statusCode: 400,
                })
            );
        });

        it('returns 404 when schedule is empty', async () => {
            vi.spyOn(prisma.schedule, 'findMany').mockResolvedValue([]);

            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-19', endDate: '2025-05-25' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Расписание отсутствует', statusCode: 404 })
            );
        });

        it('returns 400 when no lessons match the date range', async () => {
            vi.spyOn(prisma.schedule, 'findMany').mockResolvedValue([
                { ...scheduleEntry, dayOfWeek: 3 },
            ]);

            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-19', endDate: '2025-05-20' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Нет уроков для генерации', statusCode: 400 })
            );
        });

        it('creates lessons for matching weekdays in range', async () => {
            vi.spyOn(prisma.schedule, 'findMany').mockResolvedValue([scheduleEntry]);
            vi.spyOn(prisma.lesson, 'createMany').mockResolvedValue({ count: 1 });

            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-19', endDate: '2025-05-25' },
                }),
                res,
                next
            );

            expect(prisma.lesson.createMany).toHaveBeenCalledWith({
                data: [
                    expect.objectContaining({
                        clubId: 1,
                        startTime: '10:00',
                        endTime: '11:00',
                        room: 'Зал 1',
                        status: 'SCHEDULED',
                        assignedTeacherId: 7,
                    }),
                ],
                skipDuplicates: true,
            });

            const lessonDate = prisma.lesson.createMany.mock.calls[0][0].data[0].date;
            expect(lessonDate.getDay()).toBe(1);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({
                success: true,
                message: 'Created 1 lessons',
                data: { count: 1 },
            });
        });

        it('generates multiple lessons across several weeks', async () => {
            vi.spyOn(prisma.schedule, 'findMany').mockResolvedValue([scheduleEntry]);
            vi.spyOn(prisma.lesson, 'createMany').mockResolvedValue({ count: 2 });

            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-19', endDate: '2025-05-26' },
                }),
                res,
                next
            );

            expect(prisma.lesson.createMany.mock.calls[0][0].data).toHaveLength(2);
            expect(res.body.message).toBe('Created 2 lessons');
        });

        it('forwards errors to next', async () => {
            const err = new Error('generate failed');
            vi.spyOn(prisma.schedule, 'findMany').mockRejectedValue(err);

            await controller.generateLessons(
                createReq({
                    body: { startDate: '2025-05-19', endDate: '2025-05-25' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
