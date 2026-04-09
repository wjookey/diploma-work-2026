const prisma = require('../config/prisma');

exports.getStats = async (req, res, next) => {
    try {
        const [
            totalChildren,
            totalClubs,
            totalTeachers,
            activeSubscriptions,
            pendingRequests,
            todayLessons,
            paymentsThisMonth,
        ] = await Promise.all([
            prisma.child.count(),
            prisma.club.count(),
            prisma.teacher.count(),
            prisma.subscription.count({ where: { status: 'ACTIVE' } }),
            prisma.subscriptionRequest.count({ where: { status: 'PENDING' } }),
            prisma.lesson.count({
                where: {
                    date: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lt: new Date(new Date().setHours(23, 59, 59, 999)),
                    },
                    status: 'SCHEDULED',
                },
            }),
            prisma.payment.aggregate({
                where: {
                    paymentDate: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
                _sum: { amount: true },
                _count: { id: true },
            }),
        ]);

        res.json({
            success: true,
            data: {
                totalChildren,
                totalClubs,
                totalTeachers,
                activeSubscriptions,
                pendingRequests,
                todayLessons,
                monthlyRevenue: paymentsThisMonth._sum.amount || 0,
                monthlyPaymentsCount: paymentsThisMonth._count.id,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getRecentActivity = async (req, res, next) => {
    try {
        const [recentPayments, recentRequests, upcomingLessons] = await Promise.all([
            prisma.payment.findMany({
                take: 5,
                orderBy: { paymentDate: 'desc' },
                include: {
                    subscription: {
                        include: {
                            child: { select: { firstName: true, lastName: true, birthDate: true } },
                            clubService: {
                                include: {
                                    club: { select: { name: true } },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.subscriptionRequest.findMany({
                take: 5,
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
                include: {
                    family: {
                        include: {
                            parents: {
                                include: {
                                    user: { select: { firstName: true, lastName: true } },
                                },
                            },
                        },
                    },
                    child: { select: { firstName: true, lastName: true } },
                    clubService: {
                        include: {
                            club: { select: { name: true } },
                        },
                    },
                },
            }),
            prisma.lesson.findMany({
                take: 5,
                where: {
                    date: { gte: new Date() },
                    status: 'SCHEDULED',
                },
                orderBy: { date: 'asc' },
                include: {
                    club: { select: { name: true } },
                    teacher: {
                        include: { user: { select: { firstName: true, lastName: true } } },
                    },
                },
            }),
        ]);

        res.json({
            success: true,
            data: { recentPayments, recentRequests, upcomingLessons },
        });
    } catch (error) {
        next(error);
    }
};