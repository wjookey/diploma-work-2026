const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
    subscription: {
        include: {
            child: {
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
                },
            },
            clubService: {
                include: {
                    club: { select: { id: true, name: true } },
                },
            },
        },
    },
};

const detailInclude = {
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
};

const buildListWhere = (user, query) => {
    const { subscriptionId, dateFrom, dateTo } = query;
    const where = {};

    if (subscriptionId) where.subscriptionId = parseInt(subscriptionId);
    if (dateFrom || dateTo) {
        where.paymentDate = {};
        if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
        if (dateTo) {
            where.paymentDate.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
    }
    if (user.role === 'PARENT') {
        where.subscription = { child: {} };
        where.subscription.child.familyId = user.parent.familyId;
    }

    return where;
};

const buildStatsWhere = ({ dateFrom, dateTo }) => {
    const where = {};

    if (dateFrom || dateTo) {
        where.paymentDate = {};
        if (dateFrom) where.paymentDate.gte = new Date(dateFrom);
        if (dateTo) {
            where.paymentDate.lt = new Date(new Date(dateTo).getTime() + 24 * 60 * 60 * 1000);
        }
    }

    return where;
};

exports.getAll = async (user, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(user, query);

    const [payments, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            include: listInclude,
            orderBy: { paymentDate: 'desc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        data: payments,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            subscription: true,
        },
    });

    if (!payment) {
        throw new AppError('Оплата не найдена', 404);
    }

    return payment;
};

exports.create = async (body) => {
    const { subscriptionId, amount, paymentDate, paymentMethod, note } = body;

    const existingPayment = await prisma.payment.findUnique({
        where: { subscriptionId: parseInt(subscriptionId) },
    });

    if (existingPayment) {
        throw new AppError('Выбранный абонемент уже оплачен', 400);
    }

    const subscription = await prisma.subscription.findUnique({
        where: { id: parseInt(subscriptionId) },
        include: {
            clubService: true,
        },
    });

    if (!subscription) {
        throw new AppError('Абонемент не найден', 404);
    }

    return prisma.payment.create({
        data: {
            subscriptionId: parseInt(subscriptionId),
            amount: parseFloat(amount),
            paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
            paymentMethod,
            note,
        },
        include: detailInclude,
    });
};

exports.update = async (id, body) => {
    const { amount, paymentDate, paymentMethod, note } = body;

    return prisma.payment.update({
        where: { id },
        data: {
            ...(amount && { amount: parseFloat(amount) }),
            ...(paymentDate && { paymentDate: new Date(paymentDate) }),
            ...(paymentMethod && { paymentMethod }),
            ...(note !== undefined && { note }),
        },
        include: detailInclude,
    });
};

exports.remove = async (id) => {
    await prisma.payment.delete({
        where: { id },
    });
};

exports.getStats = async (query) => {
    const where = buildStatsWhere(query);

    const stats = await prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
    });

    return {
        totalAmount: stats._sum || 0,
        totalPayments: stats._count.id,
        averageAmoung: stats._avg || 0,
    };
};
