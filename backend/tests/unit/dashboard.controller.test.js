const prisma = require('../../src/config/prisma');
const { createRes, createNext, createReq } = require('./helpers/mockHttp');

const dashboardControllerPath = require.resolve('../../src/controllers/dashboard.controller');
const dashboardModelPath = require.resolve('../../src/model/dashboard');

let controller;

const loadController = () => {
    delete require.cache[dashboardModelPath];
    delete require.cache[dashboardControllerPath];
    return require('../../src/controllers/dashboard.controller');
};

const TODAY = new Date('2025-05-21T14:00:00');

const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));
const endOfToday = () => new Date(new Date().setHours(23, 59, 59, 999));
const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1);

describe('dashboard.controller (unit)', () => {
    let res;
    let next;

    beforeEach(() => {
        vi.restoreAllMocks();
        controller = loadController();
        res = createRes();
        next = createNext();
    });

    describe('getStats', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('returns dashboard statistics', async () => {
            vi.spyOn(prisma.child, 'count').mockResolvedValue(120);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(8);
            vi.spyOn(prisma.teacher, 'count').mockResolvedValue(15);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(95);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(7);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(12);
            vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
                _sum: { amount: 150000 },
                _count: { id: 42 },
            });

            await controller.getStats(createReq(), res, next);

            expect(prisma.subscription.count).toHaveBeenCalledWith({
                where: { status: 'ACTIVE' },
            });
            expect(prisma.subscriptionRequest.count).toHaveBeenCalledWith({
                where: { status: 'PENDING' },
            });
            expect(prisma.lesson.count).toHaveBeenCalledWith({
                where: {
                    date: {
                        gte: startOfToday(),
                        lt: endOfToday(),
                    },
                    status: 'SCHEDULED',
                },
            });
            expect(prisma.payment.aggregate).toHaveBeenCalledWith({
                where: {
                    paymentDate: { gte: startOfMonth() },
                },
                _sum: { amount: true },
                _count: { id: true },
            });

            expect(res.body).toEqual({
                success: true,
                data: {
                    totalChildren: 120,
                    totalClubs: 8,
                    totalTeachers: 15,
                    activeSubscriptions: 95,
                    pendingRequests: 7,
                    todayLessons: 12,
                    monthlyRevenue: 150000,
                    monthlyPaymentsCount: 42,
                },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('returns zero monthly revenue when no payments', async () => {
            vi.spyOn(prisma.child, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.teacher, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
                _sum: { amount: null },
                _count: { id: 0 },
            });

            await controller.getStats(createReq(), res, next);

            expect(res.body.data.monthlyRevenue).toBe(0);
            expect(res.body.data.monthlyPaymentsCount).toBe(0);
        });

        it('forwards errors to next', async () => {
            const err = new Error('stats failed');
            vi.spyOn(prisma.child, 'count').mockRejectedValue(err);
            vi.spyOn(prisma.club, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.teacher, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscription, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.subscriptionRequest, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.lesson, 'count').mockResolvedValue(0);
            vi.spyOn(prisma.payment, 'aggregate').mockResolvedValue({
                _sum: { amount: 0 },
                _count: { id: 0 },
            });

            await controller.getStats(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    describe('getRecentActivity', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(TODAY);
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('returns recent payments, requests and upcoming lessons', async () => {
            const recentPayments = [{ id: 1, amount: 5000 }];
            const recentRequests = [{ id: 2, status: 'PENDING' }];
            const upcomingLessons = [{ id: 3, status: 'SCHEDULED' }];

            vi.spyOn(prisma.payment, 'findMany').mockResolvedValue(recentPayments);
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockResolvedValue(recentRequests);
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue(upcomingLessons);

            await controller.getRecentActivity(createReq(), res, next);

            expect(prisma.payment.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                    orderBy: { paymentDate: 'desc' },
                })
            );
            expect(prisma.subscriptionRequest.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                    where: { status: 'PENDING' },
                    orderBy: { createdAt: 'desc' },
                })
            );
            expect(prisma.lesson.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                    where: {
                        date: { gte: TODAY },
                        status: 'SCHEDULED',
                    },
                    orderBy: { date: 'asc' },
                })
            );

            expect(res.body).toEqual({
                success: true,
                data: { recentPayments, recentRequests, upcomingLessons },
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('forwards errors to next', async () => {
            const err = new Error('activity failed');
            vi.spyOn(prisma.payment, 'findMany').mockRejectedValue(err);
            vi.spyOn(prisma.subscriptionRequest, 'findMany').mockResolvedValue([]);
            vi.spyOn(prisma.lesson, 'findMany').mockResolvedValue([]);

            await controller.getRecentActivity(createReq(), res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
