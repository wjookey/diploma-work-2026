const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const clubsControllerPath = require.resolve('../../src/controllers/clubs.controller');
const clubModelPath = require.resolve('../../src/model/club');

let controller;

const loadController = () => {
    delete require.cache[clubModelPath];
    delete require.cache[clubsControllerPath];
    return require('../../src/controllers/clubs.controller');
};

describe('clubs.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, name: 'Плавание', isActive: true }];

        it('returns paginated clubs without filters', async () => {
            vi.spyOn(prisma.club, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ query: {} }), res, next);

            expect(prisma.club.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by isActive, classCategoryId and search', async () => {
            vi.spyOn(prisma.club, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({
                    query: {
                        isActive: 'true',
                        classCategoryId: '3',
                        search: 'плавание',
                    },
                }),
                res,
                next
            );

            expect(prisma.club.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        classCategoryId: 3,
                        name: { contains: 'плавание', mode: 'insensitive' },
                    },
                })
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.club, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(30);

            await controller.getAll(
                createReq({ query: { page: '2', limit: '15' } }),
                res,
                next
            );

            expect(prisma.club.findMany).toHaveBeenCalledWith(
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
            vi.spyOn(prisma.club, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const club = { id: 5, name: 'Шахматы', clubCategory: { id: 1 } };

        it('returns club when found', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);

            await controller.getById(
                createReq({ params: { id: '5' } }),
                res,
                next
            );

            expect(prisma.club.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } })
            );
            expect(res.body).toEqual({ success: true, data: club });
        });

        it('returns 404 when club is missing', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Кружок не найден', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        const createBody = {
            name: 'Плавание',
            description: 'Бассейн',
            classCategoryId: '2',
            defaultTeacherId: '7',
            maxStudents: '15',
            dayClasses: false,
        };

        it('creates club with default teacher', async () => {
            const created = { id: 10, name: 'Плавание' };
            vi.spyOn(prisma.club, 'create').mockResolvedValue(created);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.club.create).toHaveBeenCalledWith({
                data: {
                    name: 'Плавание',
                    description: 'Бассейн',
                    classCategoryId: 2,
                    defaultTeacherId: 7,
                    dayClasses: false,
                    maxStudents: 15,
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });

        it('sets defaultTeacherId to null for day classes', async () => {
            vi.spyOn(prisma.club, 'create').mockResolvedValue({ id: 11 });

            await controller.create(
                createReq({
                    body: { ...createBody, dayClasses: true, defaultTeacherId: '7' },
                }),
                res,
                next
            );

            expect(prisma.club.create.mock.calls[0][0].data.defaultTeacherId).toBeNull();
            expect(prisma.club.create.mock.calls[0][0].data.dayClasses).toBe(true);
        });

        it('sets maxStudents to null when not provided', async () => {
            vi.spyOn(prisma.club, 'create').mockResolvedValue({ id: 12 });

            const { maxStudents, ...bodyWithoutMax } = createBody;

            await controller.create(createReq({ body: bodyWithoutMax }), res, next);

            expect(prisma.club.create.mock.calls[0][0].data.maxStudents).toBeNull();
        });
    });

    describe('update', () => {
        it('updates provided club fields', async () => {
            const updated = { id: 4, name: 'Обновлённый' };
            vi.spyOn(prisma.club, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '4' },
                    body: {
                        name: 'Обновлённый',
                        description: 'Новое описание',
                        classCategoryId: '3',
                        defaultTeacherId: '8',
                        maxStudents: '20',
                        isActive: true,
                    },
                }),
                res,
                next
            );

            expect(prisma.club.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: {
                    name: 'Обновлённый',
                    description: 'Новое описание',
                    classCategoryId: 3,
                    defaultTeacherId: 8,
                    maxStudents: 20,
                    isActive: true,
                },
                include: expect.any(Object),
            });
        });

        it('clears defaultTeacherId when dayClasses is enabled', async () => {
            vi.spyOn(prisma.club, 'update').mockResolvedValue({ id: 4 });

            await controller.update(
                createReq({
                    params: { id: '4' },
                    body: { dayClasses: true, defaultTeacherId: '8' },
                }),
                res,
                next
            );

            expect(prisma.club.update.mock.calls[0][0].data).toMatchObject({
                dayClasses: true,
                defaultTeacherId: null,
            });
        });

        it('allows clearing description with empty string', async () => {
            vi.spyOn(prisma.club, 'update').mockResolvedValue({ id: 4 });

            await controller.update(
                createReq({ params: { id: '4' }, body: { description: '' } }),
                res,
                next
            );

            expect(prisma.club.update.mock.calls[0][0].data).toEqual({ description: '' });
        });
    });

    describe('updateStatus', () => {
        it('updates isActive status', async () => {
            vi.spyOn(prisma.club, 'update').mockResolvedValue({ id: 6, isActive: false });

            await controller.updateStatus(
                createReq({ params: { id: '6' }, body: { isActive: false } }),
                res,
                next
            );

            expect(prisma.club.update).toHaveBeenCalledWith({
                where: { id: 6 },
                data: { isActive: false },
            });
            expect(res.body).toEqual({ success: true, message: 'Status is updated' });
        });
    });

    describe('remove', () => {
        it('returns 409 when club has active subscriptions', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(3);
            const deleteSpy = vi.spyOn(prisma.club, 'delete');

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данному кружку привязаны абонементы',
                    statusCode: 409,
                })
            );
        });

        it('returns 409 when club has pending requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(2);
            const deleteSpy = vi.spyOn(prisma.club, 'delete');

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данному кружку привязаны заявки',
                    statusCode: 409,
                })
            );
        });

        it('deletes club when no linked subscriptions or requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.club, 'delete').mockResolvedValue({ id: 5 });

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(prisma.club.delete).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(res.body).toEqual({ success: true, message: 'Club is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.club, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
