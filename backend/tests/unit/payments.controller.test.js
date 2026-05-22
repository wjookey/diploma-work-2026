const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const paymentsControllerPath = require.resolve('../../src/controllers/payments.controller');
const paymentModelPath = require.resolve('../../src/model/payment');

let controller;

const loadController = () => {
    delete require.cache[paymentModelPath];
    delete require.cache[paymentsControllerPath];
    return require('../../src/controllers/payments.controller');
};

const TODAY = new Date('2025-05-21T14:00:00');

describe('payments.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getAll', () => {
        const sample = [{ id: 1, amount: 5000 }];

        it('returns paginated payments for admin', async () => {
            vi.spyOn(prisma.payment, 'findMany').mockResolvedValue(sample);
            vi.spyOn(prisma.payment, 'count').mockResolvedValue(1);

            await controller.getAll(
                createReq({ user: { role: 'ADMIN' }, query: {} }),
                res,
                next
            );

            expect(prisma.payment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: {}, skip: 0, take: 20 })
            );
            expect(res.body).toEqual({
                success: true,
                data: sample,
                pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
            });
        });

        it('filters by subscriptionId and payment date range', async () => {
            vi.spyOn(prisma.payment, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.payment, 'count').mockResolvedValue(0);

            const dateFrom = '2025-05-01';
            const dateTo = '2025-05-10';

            await controller.getAll(
                createReq({
                    user: { role: 'ADMIN' },
                    query: { subscriptionId: '15', dateFrom, dateTo },
                }),
                res,
                next
            );

            const callWhere = prisma.payment.findMany.mock.calls[0][0].where;
            expect(callWhere.subscriptionId).toBe(15);
            expect(callWhere.paymentDate.gte).toEqual(new Date(dateFrom));
            expect(callWhere.paymentDate.lt).toEqual(
                new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
            );
        });

        it('restricts payments to parent family', async () => {
            vi.spyOn(prisma.payment, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.payment, 'count').mockResolvedValue(0);

            await controller.getAll(
                createReq({ user: { role: 'PARENT', parent: { familyId: 10 } }, query: {} }),
                res,
                next
            );

            expect(prisma.payment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        subscription: { child: { familyId: 10 } },
                    },
                })
            );
        });

        it('forwards errors to next', async () => {
            const err = new Error('DB failure');
            vi.spyOn(prisma.payment, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.payment, 'count').mockResolvedValue(0);

            await controller.getAll(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getById', () => {
        const payment = { id: 4, amount: 3000, subscription: { id: 1 } };

        it('returns payment when found', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(payment);

            await controller.getById(
                createReq({ params: { id: '4' } }),
                res,
                next
            );

            expect(prisma.payment.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 4 } })
            );
            expect(res.body).toEqual({ success: true, data: payment });
        });

        it('returns 404 when payment is missing', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(null);

            await controller.getById(
                createReq({ params: { id: '999' } }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Оплата не найдена', statusCode: 404 })
            );
        });
    });

    describe('create', () => {
        const createBody = {
            subscriptionId: '5',
            amount: '5000',
            paymentMethod: 'CARD',
            note: 'оплата',
        };

        const subscription = {
            id: 5,
            clubService: { id: 2, name: 'Абонемент' },
        };

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('creates payment when subscription exists and is not paid', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(subscription);
            const created = { id: 10, amount: 5000 };
            vi.spyOn(prisma.payment, 'create').mockResolvedValue(created);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(prisma.payment.create).toHaveBeenCalledWith({
                data: {
                    subscriptionId: 5,
                    amount: 5000,
                    paymentDate: TODAY,
                    paymentMethod: 'CARD',
                    note: 'оплата',
                },
                include: expect.any(Object),
            });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual({ success: true, data: created });
        });

        it('uses paymentDate from body when provided', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(subscription);
            vi.spyOn(prisma.payment, 'create').mockResolvedValue({ id: 10 });

            const paymentDate = '2025-05-15';

            await controller.create(
                createReq({ body: { ...createBody, paymentDate } }),
                res,
                next
            );

            expect(prisma.payment.create.mock.calls[0][0].data.paymentDate).toEqual(
                new Date(paymentDate)
            );
        });

        it('returns 400 when subscription is already paid', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue({ id: 99 });
            const createSpy = vi.spyOn(prisma.payment, 'create');

            await controller.create(createReq({ body: createBody }), res, next);

            expect(createSpy).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Выбранный абонемент уже оплачен',
                    statusCode: 400,
                })
            );
        });

        it('returns 404 when subscription is missing', async () => {
            vi.spyOn(prisma.payment, 'findUnique').mockResolvedValue(null);
            vi.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(null);

            await controller.create(createReq({ body: createBody }), res, next);

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Абонемент не найден', statusCode: 404 })
            );
        });
    });

    describe('update', () => {
        it('updates provided payment fields', async () => {
            const updated = { id: 3, amount: 6000 };
            vi.spyOn(prisma.payment, 'update').mockResolvedValue(updated);

            await controller.update(
                createReq({
                    params: { id: '3' },
                    body: {
                        amount: '6000',
                        paymentDate: '2025-05-18',
                        paymentMethod: 'CASH',
                        note: 'обновлено',
                    },
                }),
                res,
                next
            );

            expect(prisma.payment.update).toHaveBeenCalledWith({
                where: { id: 3 },
                data: {
                    amount: 6000,
                    paymentDate: new Date('2025-05-18'),
                    paymentMethod: 'CASH',
                    note: 'обновлено',
                },
                include: expect.any(Object),
            });
            expect(res.body).toEqual({ success: true, data: updated });
        });

        it('allows clearing note with empty string', async () => {
            vi.spyOn(prisma.payment, 'update').mockResolvedValue({ id: 3 });

            await controller.update(
                createReq({ params: { id: '3' }, body: { note: '' } }),
                res,
                next
            );

            expect(prisma.payment.update.mock.calls[0][0].data).toEqual({ note: '' });
        });
    });

    describe('remove', () => {
        it('deletes payment and returns success message', async () => {
            vi.spyOn(prisma.payment, 'delete').mockResolvedValue({ id: 8 });

            await controller.remove(
                createReq({ params: { id: '8' } }),
                res,
                next
            );

            expect(prisma.payment.delete).toHaveBeenCalledWith({ where: { id: 8 } });
            expect(res.body).toEqual({ success: true, message: 'Payment is deleted' });
        });

        it('forwards delete errors to next', async () => {
            const err = new Error('delete failed');
            vi.spyOn(prisma.payment, 'delete').mockRejectedValue(err);

            await controller.remove(createReq({ params: { id: '8' } }), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getStats', () => {
        const statsResult = {
            _sum: { amount: 25000 },
            _count: { id: 10 },
            _avg: { amount: 2500 },
        };

        it('returns aggregated payment statistics', async () => {
            vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue(statsResult);

            await controller.getStats(createReq({ query: {} }), res, next);

            expect(prisma.payment.aggregate).toHaveBeenCalledWith({
                where: {},
                _sum: { amount: true },
                _count: { id: true },
                _avg: { amount: true },
            });
            expect(res.body).toEqual({
                success: true,
                data: {
                    totalAmount: statsResult._sum,
                    totalPayments: 10,
                    averageAmoung: statsResult._avg,
                },
            });
        });

        it('filters stats by payment date range', async () => {
            vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue(statsResult);

            const dateFrom = '2025-05-01';
            const dateTo = '2025-05-31';

            await controller.getStats(
                createReq({ query: { dateFrom, dateTo } }),
                res,
                next
            );

            const callWhere = prisma.payment.aggregate.mock.calls[0][0].where;
            expect(callWhere.paymentDate.gte).toEqual(new Date(dateFrom));
            expect(callWhere.paymentDate.lt).toEqual(
                new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
            );
        });

        it('forwards errors to next', async () => {
            const err = new Error('aggregate failed');
            vi.spyOn(prisma.payment, 'aggregate').mockRejectedValue(err);

            await controller.getStats(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
