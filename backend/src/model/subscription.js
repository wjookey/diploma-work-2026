const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
    child: { select: { id: true, firstName: true, lastName: true } },
    clubService: {
        include: {
            club: {
                include: {
                    clubCategory: true,
                    teacher: {
                        include: {
                            user: { select: { id: true, firstName: true, lastName: true } },
                        },
                    },
                },
            },
        },
    },
    payment: {
        include: {
            subscription: {
                include: {
                    child: true,
                    clubService: {
                        include: {
                            club: true,
                        },
                    },
                },
            },
        },
    },
};

const detailInclude = {
    child: {
        include: {
            family: true,
        },
    },
    clubService: {
        include: {
            club: { select: { id: true, name: true, description: true } },
        },
    },
    payment: true,
};

const createInclude = {
    child: { select: { id: true, firstName: true, lastName: true } },
    clubService: {
        include: {
            club: { select: { id: true, name: true } },
        },
    },
};

const updateInclude = {
    child: { select: { id: true, firstName: true, lastName: true } },
    clubService: {
        include: {
            club: { select: { id: true, name: true } },
        },
    },
    payment: { select: { id: true, amount: true } },
};

const getNextStartDate = () => {
    const date = new Date();
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1,
        3, 0, 0, 0
    );
};

const buildSubscriptionCreateData = (childId, clubService, clubServiceId, activeSubscriptionCount) => ({
    childId: parseInt(childId),
    clubId: clubService.clubId,
    clubServiceId: parseInt(clubServiceId),
    remainingLessons: clubService.subscriptionLessons,
    usedFreezes: 0,
    startDate: activeSubscriptionCount === 0 ? getNextStartDate() : null,
    status: activeSubscriptionCount === 0 ? 'ACTIVE' : 'PENDING',
});

const activatePendingIfNeeded = async (clubId, childId) => {
    const pendingSubscription = await prisma.subscription.findFirst({
        where: {
            clubId,
            childId,
            status: 'PENDING',
        },
    });

    const activeSubscriptionCount = await prisma.subscription.count({
        where: {
            clubId,
            childId,
            status: 'ACTIVE',
        },
    });

    if (pendingSubscription && activeSubscriptionCount === 0) {
        await prisma.subscription.update({
            where: { id: pendingSubscription.id },
            data: { status: 'ACTIVE', startDate: getNextStartDate() },
        });
    }
};

const buildListWhere = (user, query) => {
    const { childId, clubId, clubServiceId, status, familyId } = query;
    const where = {};

    if (childId) where.childId = parseInt(childId);
    if (clubId) where.clubId = parseInt(clubId);
    if (clubServiceId) where.clubServiceId = parseInt(clubServiceId);
    if (status) where.status = status;
    if (user.role === 'PARENT') {
        where.child = { familyId: user.parent.familyId };
    } else if (familyId) {
        where.child = { familyId: parseInt(familyId) };
    }

    return where;
};

exports.getAll = async (user, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(user, query);

    const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
            where,
            include: listInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.subscription.count({ where }),
    ]);

    return {
        data: subscriptions,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id, user) => {
    const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: detailInclude,
    });

    if (!subscription) {
        throw new AppError('Абонемент не найден', 404);
    }

    if (user.role === 'PARENT' && subscription.child.familyId !== user.parent.familyId) {
        throw new AppError('Forbidden', 403);
    }

    return subscription;
};

exports.create = async ({ childId, clubServiceId }) => {
    const clubService = await prisma.clubService.findUnique({
        where: { id: parseInt(clubServiceId) },
    });

    if (!clubService) {
        throw new AppError('Услуга не найдена', 404);
    }

    const activeSubscriptionCount = await prisma.subscription.count({
        where: { childId: parseInt(childId), clubId: clubService.clubId, status: 'ACTIVE' },
    });

    return prisma.subscription.create({
        data: buildSubscriptionCreateData(childId, clubService, clubServiceId, activeSubscriptionCount),
        include: createInclude,
    });
};

exports.createCombo = async ({ comboSubscriptions }) => {
    return prisma.$transaction(async (tx) => {
        const createdCombo = [];

        for (const comboSubscription of comboSubscriptions) {
            const service = await tx.clubService.findUnique({
                where: { id: parseInt(comboSubscription.clubServiceId) },
            });

            if (!service) {
                throw new AppError('Услуга не найдена', 404);
            }

            const activeSubscriptionCount = await tx.subscription.count({
                where: {
                    clubId: service.clubId,
                    childId: parseInt(comboSubscription.childId),
                    status: 'ACTIVE',
                },
            });

            const createdSubscription = await tx.subscription.create({
                data: buildSubscriptionCreateData(
                    comboSubscription.childId,
                    service,
                    comboSubscription.clubServiceId,
                    activeSubscriptionCount
                ),
            });

            createdCombo.push(createdSubscription);
        }

        return createdCombo;
    });
};

exports.update = async (id, { remainingLessons, usedFreezes }) => {
    const isExpired = parseInt(remainingLessons) === 0;

    const subscription = await prisma.subscription.update({
        where: { id },
        data: {
            ...(remainingLessons !== undefined && { remainingLessons: parseInt(remainingLessons) }),
            ...(usedFreezes !== undefined && { usedFreezes: parseInt(usedFreezes) }),
            ...(remainingLessons !== undefined && { status: isExpired ? 'EXPIRED' : 'ACTIVE' }),
        },
        include: updateInclude,
    });

    if (isExpired) {
        await activatePendingIfNeeded(subscription.clubId, subscription.childId);
    }

    return subscription;
};

exports.cancel = async (id) => {
    const subscription = await prisma.subscription.findUnique({
        where: { id },
    });

    await prisma.subscription.update({
        where: { id },
        data: { status: 'CANCELLED', endDate: new Date() },
    });

    await activatePendingIfNeeded(subscription.clubId, subscription.childId);
};

exports.remove = async (id) => {
    const sub = await prisma.subscription.findUnique({
        where: { id },
    });

    await prisma.subscription.delete({
        where: { id },
    });

    await activatePendingIfNeeded(sub.clubId, sub.childId);
};
