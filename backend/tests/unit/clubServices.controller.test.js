const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const clubServicesControllerPath = require.resolve('../../src/controllers/clubServices.controller');
const clubServiceModelPath = require.resolve('../../src/model/clubService');

let controller;

const loadController = () => {
    delete require.cache[clubServiceModelPath];
    delete require.cache[clubServicesControllerPath];
    return require('../../src/controllers/clubServices.controller');
};

describe('clubServices.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, name: 'Абонемент 12 занятий', type: 'SUBSCRIPTION' }];

        it('returns paginated club services without filters', async () => {
            vi.spyOn(prisma.clubService, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.clubService, 'count').mockResolvedValue(1);

            await controller.getAll(createReq({ query: {} }), res, next);

            expect(prisma.clubService.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by isActive, clubId, type and search', async () => {
            vi.spyOn(prisma.clubService, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.clubService, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({
                    query: {
                        isActive: 'true',
                        clubId: '5',
                        type: 'SUBSCRIPTION',
                        search: 'абонемент',
                    },
                }),
                res,
                next
            );

            expect(prisma.clubService.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        isActive: true,
                        clubId: 5,
                        type: 'SUBSCRIPTION',
                        OR: [
                            { name: { contains: 'абонемент', mode: 'insensitive' } },
                            { club: { name: { contains: 'абонемент', mode: 'insensitive' } } },
                            { club: { clubCategory: { name: { contains: 'абонемент', mode: 'insensitive' } } } },
                        ],
                    },
                })
            );
        });

        it('applies pagination from query', async () => {
            vi.spyOn(prisma.clubService, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.clubService, 'count').mockResolvedValue(40);

            await controller.getAll(
                createReq({ query: { page: '2', limit: '10' } }),
                res,
                next
            );

            expect(prisma.clubService.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 10, take: 10 })
            );
            expect(res.body.pagination).toMatchObject({
                total: 40,
                page: 2,
                limit: 10,
                totalPages: 4,
            });
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.clubService, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.clubService, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const service = { id: 3, name: 'Разовое', club: { name: 'Плавание' } };

        it('returns club service when found', async () => {
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(service);

            await controller.getById(
                createReq({ params: { id: '3' } }),
                res,
                next
            );

            expect(prisma.clubService.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 3 } })
            );
            expect(res.body).toEqual({ success: true, data: service });
        });

        it('returns 404 when service is missing', async () => {
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Услуга не найдена', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        const club = { id: 5, name: 'Плавание' };
        const createBody = {
            name: 'Абонемент 12',
            price: '5000',
            subscriptionLessons: '12',
            freezedLesson: '2',
            clubId: '5',
            type: 'SUBSCRIPTION',
            isCombo: false,
        };

        it('creates club service when club exists', async () => {
            const created = { id: 10, name: 'Абонемент 12' };
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.clubService, 'create').mockResolvedValue(created);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.clubService.create).toHaveBeenCalledWith({
                data: {
                    name: 'Абонемент 12',
                    price: 5000,
                    subscriptionLessons: 12,
                    freezedLesson: 2,
                    clubId: 5,
                    type: 'SUBSCRIPTION',
                    isCombo: false,
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });

        it('sets freezedLesson to 0 when not provided', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(club);
            vi.spyOn(prisma.clubService, 'create').mockResolvedValue({ id: 11 });

            const { freezedLesson, ...bodyWithoutFreeze } = createBody;

            await controller.create(createReq({ body: bodyWithoutFreeze }), res, next);

            expect(prisma.clubService.create.mock.calls[0][0].data.freezedLesson).toBe(0);
        });

        it('returns 404 when club is missing', async () => {
            vi.spyOn(prisma.club, 'findUnique').mockResolvedValue(null);
            const createSpy = vi.spyOn(prisma.clubService, 'create');

            await controller.create(createReq({ body: createBody }), res, next);

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Кружок не найден', statusCode: 404 })
            );
        });
    });

    describe('update', () => {
        it('updates provided fields', async () => {
            const updated = { id: 4, name: 'Обновлённый' };
            vi.spyOn(prisma.clubService, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '4' },
                    body: {
                        name: 'Обновлённый',
                        price: '6000',
                        subscriptionLessons: '10',
                        freezedLesson: 1,
                        type: 'SUBSCRIPTION',
                        isCombo: true,
                    },
                }),
                res,
                next
            );

            expect(prisma.clubService.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: {
                    name: 'Обновлённый',
                    price: 6000,
                    subscriptionLessons: 10,
                    freezedLesson: 1,
                    type: 'SUBSCRIPTION',
                    isCombo: true,
                },
                include: expect.any(Object),
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('allows setting freezedLesson to 0', async () => {
            vi.spyOn(prisma.clubService, 'update').mockResolvedValue({ id: 4 });

            await controller.update(
                createReq({ params: { id: '4' }, body: { freezedLesson: 0 } }),
                res,
                next
            );

            expect(prisma.clubService.update.mock.calls[0][0].data).toEqual({ freezedLesson: 0 });
        });
    });

    describe('updateStatus', () => {
        it('updates isActive status', async () => {
            vi.spyOn(prisma.clubService, 'update').mockResolvedValue({ id: 6, isActive: false });

            await controller.updateStatus(
                createReq({ params: { id: '6' }, body: { isActive: false } }),
                res,
                next
            );

            expect(prisma.clubService.update).toHaveBeenCalledWith({
                where: { id: 6 },
                data: { isActive: false },
            });
            expect(res.body).toEqual({ success: true, message: 'Status is updated' });
        });
    });

    describe('remove', () => {
        it('returns 409 when service has linked subscriptions', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(2);
            const deleteSpy = vi.spyOn(prisma.clubService, 'delete');

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данной услуге привязаны абонементы',
                    statusCode: 409,
                })
            );
        });

        it('returns 409 when service has pending requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(1);
            const deleteSpy = vi.spyOn(prisma.clubService, 'delete');

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете совершить это действие, так как к данной услуге привязаны заявки',
                    statusCode: 409,
                })
            );
        });

        it('deletes service when no linked subscriptions or requests', async () => {
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.clubService, 'delete').mockResolvedValue({ id: 7 });

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(prisma.subscription.count).toHaveBeenCalledWith({
                where: { clubServiceId: 7, status: 'ACTIVE' },
            });
            expect(prisma.clubService.delete).toHaveBeenCalledWith({ where: { id: 7 } });
            expect(res.body).toEqual({ success: true, message: 'Club service is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.clubService, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '7' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
