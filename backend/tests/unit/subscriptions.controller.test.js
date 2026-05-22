const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const subscriptionsControllerPath = require.resolve('../../src/controllers/subscriptions.controller');
const subscriptionModelPath = require.resolve('../../src/model/subscription');

let controller;

const loadController = () => {
    delete require.cache[subscriptionModelPath];
    delete require.cache[subscriptionsControllerPath];
    return require('../../src/controllers/subscriptions.controller');
};

const TODAY = new Date('2025-05-21T14:00:00');

const expectedStartDate = () =>
    new Date(
        TODAY.getFullYear(),
        TODAY.getMonth(),
        TODAY.getDate() + 1,
        3,
        0,
        0,
        0
    );

const clubService = (overrides = {}) => ({
    id: 10,
    clubId: 5,
    subscriptionLessons: 12,
    ...overrides,
});

describe('subscriptions.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, status: 'ACTIVE' }];

        it('returns paginated subscriptions without filters', async () => {
            vi.spyOn(prisma.subscription, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(1);

            await controller.getAll(
                createReq({ user: { role: 'ADMIN' }, query: {} }),
                res,
                next
            );

            expect(prisma.subscription.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('applies query filters for admin', async () => {
            vi.spyOn(prisma.subscription, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({
                    user: { role: 'ADMIN' },
                    query: {
                        childId: '2',
                        clubId: '5',
                        clubServiceId: '10',
                        status: 'ACTIVE',
                        familyId: '7',
                    },
                }),
                res,
                next
            );

            expect(prisma.subscription.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        childId: 2,
                        clubId: 5,
                        clubServiceId: 10,
                        status: 'ACTIVE',
                        child: { familyId: 7 },
                    },
                })
            );
        });

        it('restricts list to parent family', async () => {
            vi.spyOn(prisma.subscription, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 42 } },
                    query: { familyId: '99' },
                }),
                res,
                next
            );

            expect(prisma.subscription.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        child: { familyId: 42 },
                    }),
                })
            );
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.subscription, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const subscription = {
            id: 3,
            child: { familyId: 10 },
        };

        it('returns subscription when found', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(subscription);

            await controller.getById(
                createReq({ user: { role: 'ADMIN' }, params: { id: '3' } }),
                res,
                next
            );

            expect(prisma.subscription.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 3 } })
            );
            expect(res.body).toEqual({ success: true, data: subscription });
        });

        it('returns 404 when subscription is missing', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Абонемент не найден', statusCode: 404 })
            );
        });

        it('returns 403 when parent requests another family subscription', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
                id: 3,
                child: { familyId: 99 },
            });

            await controller.getById(
                createReq({
                    user: { role: 'PARENT', parent: { familyId: 10 } },
                    params: { id: '3' },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Forbidden', statusCode: 403 })
            );
        });
    });

    describe('create', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        const createBody = { childId: 1, clubServiceId: 10 };

        it('creates ACTIVE subscription when no active exists for child and club', async () => {
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(clubService());
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscription, 'create').mockResolvedValue({
                id: 100,
                status: 'ACTIVE',
            });

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.subscription.create).toHaveBeenCalledWith({
                data: {
                    childId: 1,
                    clubId: 5,
                    clubServiceId: 10,
                    remainingLessons: 12,
                    usedFreezes: 0,
                    startDate: expectedStartDate(),
                    status: 'ACTIVE',
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
        });

        it('creates PENDING subscription when active already exists', async () => {
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(clubService());
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(1);
            vi.spyOn(prisma.subscription, 'create').mockResolvedValue({
                id: 101,
                status: 'PENDING',
            });

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.subscription.create.mock.calls[0][0].data).toMatchObject({
                startDate: null,
                status: 'PENDING',
            });
        });

        it('returns 404 when club service is missing', async () => {
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(null);
            const createSpy = vi.spyOn(prisma.subscription, 'create');

            await controller.create(createReq({ body: createBody }), res, next);

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Услуга не найдена', statusCode: 404 })
            );
        });
    });

    describe('createCombo', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('creates multiple subscriptions in transaction', async () => {
            const tx = {
                clubService: {
                    findUnique: vi.fn().mockResolvedValue(clubService()),
                },
                subscription: {
                    count: vi.fn().mockResolvedValue(0),
                    create: vi
                        .fn()
                        .mockResolvedValueOnce({ id: 1, status: 'ACTIVE' })
                        .mockResolvedValueOnce({ id: 2, status: 'ACTIVE' }),
                },
            };

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.createCombo(
                createReq({
                    body: {
                        comboSubscriptions: [
                            { childId: 1, clubServiceId: 10 },
                            { childId: 2, clubServiceId: 10 },
                        ],
                    },
                }),
                res,
                next
            );

            expect(tx.subscription.create).toHaveBeenCalledTimes(2);
            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveLength(2);
        });

        it('forwards service not found from transaction', async () => {
            const tx = {
                clubService: { findUnique: vi.fn().mockResolvedValue(null) },
                subscription: { count: vi.fn(), create: vi.fn() },
            };

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.createCombo(
                createReq({
                    body: { comboSubscriptions: [{ childId: 1, clubServiceId: 99 }] },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Услуга не найдена', statusCode: 404 })
            );
        });
    });

    describe('update', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('updates remainingLessons and usedFreezes', async () => {
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
                status: 'ACTIVE',
            });

            await controller.update(
                createReq({
                    params: { id: '5' },
                    body: { remainingLessons: 8, usedFreezes: 1 },
                }),
                res,
                next
            );

            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: 5 },
                data: {
                    remainingLessons: 8,
                    usedFreezes: 1,
                    status: 'ACTIVE',
                },
                include: expect.any(Object),
            });
        });

        it('sets status to EXPIRED when remainingLessons is 0', async () => {
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
                status: 'EXPIRED',
            });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);

            await controller.update(
                createReq({
                    params: { id: '5' },
                    body: { remainingLessons: 0 },
                }),
                res,
                next
            );

            expect(prisma.subscription.update.mock.calls[0][0].data.status).toBe('EXPIRED');
        });

        it('activates pending subscription when current expires', async () => {
            vi.spyOn(prisma.subscription, 'update')
                .mockResolvedValueOnce({
                    id: 5,
                    clubId: 3,
                    childId: 1,
                    status: 'EXPIRED',
                })
                .mockResolvedValueOnce({ id: 6, status: 'ACTIVE' });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 6 });
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.update(
                createReq({
                    params: { id: '5' },
                    body: { remainingLessons: 0 },
                }),
                res,
                next
            );

            expect(prisma.subscription.update).toHaveBeenLastCalledWith({
                where: { id: 6 },
                data: { status: 'ACTIVE', startDate: expectedStartDate() },
            });
        });
    });

    describe('cancel', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('cancels subscription and returns success message', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
            });
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({});
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.cancel(
                createReq({ params: { id: '5' } }),
                res,
                next
            );

            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: 5 },
                data: { status: 'CANCELLED', endDate: TODAY },
            });
            expect(res.body).toEqual({ success: true, message: 'Subscription is cancelled' });
        });

        it('activates pending subscription after cancel when no active left', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
            });
            vi.spyOn(prisma.subscription, 'update')
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ id: 6, status: 'ACTIVE' });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 6 });
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.cancel(createReq({ params: { id: '5' } }), res, next);

            expect(prisma.subscription.update).toHaveBeenLastCalledWith({
                where: { id: 6 },
                data: { status: 'ACTIVE', startDate: expectedStartDate() },
            });
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('deletes subscription and returns success message', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
            });
            vi.spyOn(prisma.subscription, 'delete').mockResolvedValue({ id: 5 });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);

            await controller.remove(
                createReq({ params: { id: '5' } }),
                res,
                next
            );

            expect(prisma.subscription.delete).toHaveBeenCalledWith({ where: { id: 5 } });
            expect(res.body).toEqual({ success: true, message: 'Subscription is deleted' });
        });

        it('activates pending subscription after delete when no active left', async () => {
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
                id: 5,
                clubId: 3,
                childId: 1,
            });
            vi.spyOn(prisma.subscription, 'delete').mockResolvedValue({ id: 5 });
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 6 });
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscription, 'update').mockResolvedValue({ id: 6 });

            await controller.remove(createReq({ params: { id: '5' } }), res, next);

            expect(prisma.subscription.update).toHaveBeenCalledWith({
                where: { id: 6 },
                data: { status: 'ACTIVE', startDate: expectedStartDate() },
            });
        });
    });
});
