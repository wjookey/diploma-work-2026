const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const subscriptionRequestsControllerPath = require.resolve(
    '../../src/controllers/subscriptionRequests.controller'
);
const subscriptionRequestModelPath = require.resolve('../../src/model/subscriptionRequest');

let controller;

const loadController = () => {
    delete require.cache[subscriptionRequestModelPath];
    delete require.cache[subscriptionRequestsControllerPath];
    return require('../../src/controllers/subscriptionRequests.controller');
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

const parentUser = { role: 'PARENT', parent: { familyId: 10 } };

describe('subscriptionRequests.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, status: 'PENDING' }];

        it('returns paginated requests for admin', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(1);

            await controller.getAll(
                createReq({ user: { role: 'ADMIN' }, query: {} }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('applies query filters', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({
                    user: { role: 'ADMIN' },
                    query: {
                        childId: '2',
                        clubServiceId: '5',
                        clubId: '3',
                        status: 'PENDING',
                    },
                }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        childId: 2,
                        clubServiceId: 5,
                        clubService: { clubId: 3 },
                        status: 'PENDING',
                    },
                })
            );
        });

        it('restricts list to parent family', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ user: parentUser, query: {} }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { familyId: 10 } })
            );
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const request = { id: 4, status: 'PENDING' };

        it('returns request when found', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue(request);

            await controller.getById(
                createReq({ params: { id: '4' } }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 4 } })
            );
            expect(res.body).toEqual({ success: true, data: request });
        });

        it('returns 404 when request is missing', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Заявка не найдена', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        const createBody = { childId: 1, clubServiceId: 5, message: 'Хочу записаться' };

        it('returns 403 for non-parent', async () => {
            await controller.create(
                createReq({ user: { role: 'ADMIN' }, body: createBody }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only parents are allowed to submit requests',
                    statusCode: 403,
                })
            );
        });

        it('creates request for parent with own child', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 1, familyId: 10 });
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue({ id: 5, clubId: 3 });
            vi.spyOn(prisma.subscriptionRequest, 'create').mockResolvedValue({
                id: 100,
                status: 'PENDING',
            });

            await controller.create(
                createReq({ user: parentUser, body: createBody }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.create).toHaveBeenCalledWith({
                data: {
                    familyId: 10,
                    childId: 1,
                    clubServiceId: 5,
                    message: 'Хочу записаться',
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
        });

        it('returns 404 when child is not in parent family', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue(null);
            const createSpy = vi.spyOn(prisma.subscriptionRequest, 'create');

            await controller.create(
                createReq({ user: parentUser, body: createBody }),
                res,
                next
            );

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Ребёнок не найден', statusCode: 404 })
            );
        });

        it('returns 404 when club service is missing', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 1 });
            vi.spyOn(prisma.clubService, 'findUnique').mockResolvedValue(null);

            await controller.create(
                createReq({ user: parentUser, body: createBody }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Услуга не найдена', statusCode: 404 })
            );
        });
    });

    describe('createCombo', () => {
        it('returns 403 for non-parent', async () => {
            await controller.createCombo(
                createReq({
                    user: { role: 'TEACHER' },
                    body: { requests: [{ childId: 1, clubServiceId: 5 }] },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 403 })
            );
        });

        it('creates multiple requests in transaction', async () => {
            const tx = {
                child: { findUnique: vi.fn().mockResolvedValue({ id: 1 }) },
                clubService: { findUnique: vi.fn().mockResolvedValue({ id: 5 }) },
                subscriptionRequest: {
                    create: vi
                        .fn()
                        .mockResolvedValueOnce({ id: 1 })
                        .mockResolvedValueOnce({ id: 2 }),
                },
            };

            vi.spyOn(prisma, '$transaction').mockImplementation(async (callback) => callback(tx));

            await controller.createCombo(
                createReq({
                    user: parentUser,
                    body: {
                        requests: [
                            { childId: 1, clubServiceId: 5, message: 'A' },
                            { childId: 2, clubServiceId: 6, message: 'B' },
                        ],
                    },
                }),
                res,
                next
            );

            expect(tx.subscriptionRequest.create).toHaveBeenCalledTimes(2);
            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('update', () => {
        it('returns 403 for non-parent', async () => {
            await controller.update(
                createReq({
                    user: { role: 'ADMIN' },
                    params: { id: '4' },
                    body: { childId: 1, clubServiceId: 5 },
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only parents are allowed to change requests',
                    statusCode: 403,
                })
            );
        });

        it('updates request for parent with valid child', async () => {
            vi.spyOn(prisma.child, 'findUnique').mockResolvedValue({ id: 2, familyId: 10 });
            vi.spyOn(prisma.subscriptionRequest, 'update').mockResolvedValue({
                id: 4,
                childId: 2,
                clubServiceId: 6,
            });

            await controller.update(
                createReq({
                    user: parentUser,
                    params: { id: '4' },
                    body: { childId: 2, clubServiceId: 6 },
                }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.update).toHaveBeenCalledWith({
                where: { id: 4 },
                data: { clubServiceId: 6, childId: 2 },
                include: expect.any(Object),
            });
        });
    });

    describe('approve', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        const pendingRequest = {
            id: 7,
            childId: 1,
            clubServiceId: 5,
            status: 'PENDING',
            clubService: { clubId: 3, subscriptionLessons: 12 },
        };

        it('returns 404 when request is missing', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue(null);

            await controller.approve(createReq({ params: { id: '7' } }), res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Заявка не найдена', statusCode: 404 })
            );
        });

        it('returns 400 when request is already processed', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue({
                ...pendingRequest,
                status: 'APPROVED',
            });

            await controller.approve(createReq({ params: { id: '7' } }), res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Заявка уже обработана', statusCode: 400 })
            );
        });

        it('creates ACTIVE subscription when no active exists', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue(pendingRequest);
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'create').mockResolvedValue({ id: 50 });
            vi.spyOn(prisma.subscriptionRequest, 'update').mockResolvedValue({ id: 7 });
            vi.spyOn(prisma, '$transaction').mockImplementation((ops) => Promise.all(ops));

            await controller.approve(createReq({ params: { id: '7' } }), res, next);

            expect(prisma.subscription.create).toHaveBeenCalledWith({
                data: {
                    childId: 1,
                    clubId: 3,
                    clubServiceId: 5,
                    remainingLessons: 12,
                    startDate: expectedStartDate(),
                    status: 'ACTIVE',
                },
            });
            expect(prisma.subscriptionRequest.update).toHaveBeenCalledWith({
                where: { id: 7 },
                data: { status: 'APPROVED' },
            });
            expect(res.body.message).toBe('Request is approved, subscription is created');
        });

        it('creates PENDING subscription when active already exists', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue(pendingRequest);
            vi.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 99 });
            vi.spyOn(prisma.subscription, 'create').mockResolvedValue({ id: 51 });
            vi.spyOn(prisma.subscriptionRequest, 'update').mockResolvedValue({ id: 7 });
            vi.spyOn(prisma, '$transaction').mockImplementation((ops) => Promise.all(ops));

            await controller.approve(createReq({ params: { id: '7' } }), res, next);

            expect(prisma.subscription.create.mock.calls[0][0].data).toMatchObject({
                startDate: null,
                status: 'PENDING',
            });
        });
    });

    describe('reject', () => {
        it('rejects pending request', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue({
                id: 8,
                status: 'PENDING',
            });
            vi.spyOn(prisma.subscriptionRequest, 'update').mockResolvedValue({ id: 8 });

            await controller.reject(createReq({ params: { id: '8' } }), res, next);

            expect(prisma.subscriptionRequest.update).toHaveBeenCalledWith({
                where: { id: 8 },
                data: { status: 'REJECTED' },
            });
            expect(res.body).toEqual({ success: true, message: 'Request is rejected' });
        });

        it('returns 400 when request is already processed', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue({
                id: 8,
                status: 'REJECTED',
            });

            await controller.reject(createReq({ params: { id: '8' } }), res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Заявка уже обработана', statusCode: 400 })
            );
        });
    });

    describe('remove', () => {
        it('returns 403 for non-parent', async () => {
            await controller.remove(
                createReq({ user: { role: 'ADMIN' }, params: { id: '9' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Only parents are allowed to remove requests',
                    statusCode: 403,
                })
            );
        });

        it('deletes pending request for parent', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue({
                id: 9,
                status: 'PENDING',
            });
            vi.spyOn(prisma.subscriptionRequest, 'delete').mockResolvedValue({ id: 9 });

            await controller.remove(
                createReq({ user: parentUser, params: { id: '9' } }),
                res,
                next
            );

            expect(prisma.subscriptionRequest.delete).toHaveBeenCalledWith({ where: { id: 9 } });
            expect(res.body).toEqual({
                success: true,
                message: 'Subscription request is deleted',
            });
        });

        it('returns 400 when deleting processed request', async () => {
            vi.spyOn(prisma.subscriptionRequest, 'findUnique').mockResolvedValue({
                id: 9,
                status: 'APPROVED',
            });
            const deleteSpy = vi.spyOn(prisma.subscriptionRequest, 'delete');

            await controller.remove(
                createReq({ user: parentUser, params: { id: '9' } }),
                res,
                next
            );

            expect(deleteSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Вы не можете удалить уже обработанную заявку',
                    statusCode: 400,
                })
            );
        });
    });
});
