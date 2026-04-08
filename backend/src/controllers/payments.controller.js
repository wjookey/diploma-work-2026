const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { subscriptionId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (subscriptionId) where.subscriptionId = parseInt(subscriptionId);
        if (dateFrom || dateTo) {
            where.paymentDate = {};
            if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
            if (dateTo) where.paymentDate.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
        if (req.user.role === 'PARENT') {
            where.subscription = { child: {} };
            where.subscription.child.familyId = req.user.parent.familyId;
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    subscription: {
                        include: {
                            child: {
                                include: {
                                    family: {
                                        include: {
                                            parents: {
                                                include: {
                                                    user: { select: { firstName: true, lastName: true } },
                                                }
                                            }
                                        }
                                    }
                                },
                            },
                            clubService: {
                                include: {
                                    club: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.payment.count({ where }),
        ]);

        res.json({
            success: true,
            data: payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                subscription: true,
            },
        });

        if (!payment) throw new AppError('Payment is not found', 404);

        res.json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
}

exports.create = async (req, res, next) => {
    try {
        const { subscriptionId, paymentDate, paymentMethod, note } = req.body;

        const existingPayment = await prisma.payment.findUnique({
            where: { subscriptionId: parseInt(subscriptionId) },
        });

        if (existingPayment) throw new AppError('Payment already exists for this subscription', 400);

        const subscription = await prisma.subscription.findUnique({
            where: { id: parseInt(subscriptionId) },
            include: {
                clubService: true,
            },
        });

        if (!subscription) throw new AppError('Subscription is not found', 404);

        const payment = await prisma.payment.create({
            data: {
                subscriptionId: parseInt(subscriptionId),
                amount: subscription.clubService.price,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                paymentMethod,
                note,
            },
            include: {
                subscription: {
                    include: {
                        child: { select: { id: true, firstName: true, lastName: true } },
                        clubService: {
                            include: {
                                club: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { paymentDate, paymentMethod, note } = req.body;

        const payment = await prisma.payment.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(paymentDate && { paymentDate: new Date(paymentDate) }),
                ...(paymentMethod && { paymentMethod }),
                ...(note !== undefined && { note }),
            },
            include: {
                subscription: {
                    include: {
                        child: { select: { id: true, firstName: true, lastName: true } },
                        clubService: {
                            include: {
                                club: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        res.json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.payment.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Payment is deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const where = {};

        if (dateFrom || dateTo) {
            where.paymentDate = {};
            if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
            if (dateTo) where.paymentDate.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }

        const stats = await prisma.prisma.aggregate({
            where,
            _sum: { amount: true },
            _count: { id: true },
            _avg: { amount: true },
        });

        res.json({
            success: true,
            data: {
                totalAmount: stats._sum || 0,
                totalPayments: stats._count.id,
                averageAmoung: stats._avg || 0,
            },
        });
    } catch (error) {
        next(error);
    }
};