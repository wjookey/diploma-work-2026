const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { childId, clubId, clubServiceId, status, familyId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (childId) where.childId = parseInt(childId);
        if (clubId) where.clubId = parseInt(clubId);
        if (clubServiceId) where.clubServiceId = parseInt(clubServiceId);
        if (status) where.status = status;
        if (req.user.role === 'PARENT') {
            where.child = { familyId: req.user.parent.familyId };
        } else if (familyId) {
            where.child = { familyId: parseInt(familyId) };
        }

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                include: {
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
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.subscription.count({ where }),
        ]);

        res.json({
            success: true,
            data: subscriptions,
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
        const subscription = await prisma.subscription.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
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
            },
        });

        if (!subscription) throw new AppError('Абонемент не найден', 404);

        if (req.user.role === 'PARENT' && subscription.child.familyId !== req.user.parent.familyId) {
            throw new AppError('Forbidden', 403);
        }

        res.json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { childId, clubServiceId } = req.body;

        const clubService = await prisma.clubService.findUnique({
            where: { id: parseInt(clubServiceId) },
        });

        if (!clubService) {
            throw new AppError('Услуга не найдена', 404);
        }

        const activeSubscriptionCount = await prisma.subscription.count({
            where: { childId: parseInt(childId), clubId: clubService.clubId, status: 'ACTIVE' },
        });

        let date = new Date()
        date = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + 1,
            0, 0, 0, 0
        ));

        const subscription = await prisma.subscription.create({
            data: {
                childId: parseInt(childId),
                clubId: clubService.clubId,
                clubServiceId: parseInt(clubServiceId),
                remainingLessons: clubService.subscriptionLessons,
                usedFreezes: 0,
                startDate: activeSubscriptionCount === 0 ? date : null,
                status: activeSubscriptionCount === 0 ? 'ACTIVE' : 'PENDING',
            },
            include: {
                child: { select: { id: true, firstName: true, lastName: true } },
                clubService: {
                    include: {
                        club: { select: { id: true, name: true } },
                    },
                },
            },
        });

        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.createCombo = async (req, res, next) => {
    try {
        const { comboSubscriptions } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const createdCombo = [];

            for (const comboSubscription of comboSubscriptions) {
                const clubService = await tx.clubService.findUnique({
                    where: { id: parseInt(comboSubscription.clubServiceId) }
                });

                if (!clubService) throw new AppError('Услуга не найдена', 404);

                const activeSubscriptionCount = await tx.subscription.count({
                    where: { clubId: clubService.clubId, childId: parseInt(comboSubscription.childId), status: 'ACTIVE' },
                });

                let date = new Date()
                date = new Date(Date.UTC(
                    date.getUTCFullYear(),
                    date.getUTCMonth(),
                    date.getUTCDate() + 1,
                    0, 0, 0, 0
                ));

                const createdSubscription = await tx.subscription.create({
                    data: {
                        childId: parseInt(comboSubscription.childId),
                        clubId: clubService.clubId,
                        clubServiceId: parseInt(comboSubscription.clubServiceId),
                        remainingLessons: clubService.subscriptionLessons,
                        usedFreezes: 0,
                        startDate: activeSubscriptionCount === 0 ? date : null,
                        status: activeSubscriptionCount === 0 ? 'ACTIVE' : 'PENDING',
                    },
                });

                createdCombo.push(createdSubscription);
            }

            return createdCombo;
        });

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { remainingLessons, usedFreezes } = req.body;

        const isExpired = parseInt(remainingLessons) === 0 ? true : false;

        const subscription = await prisma.subscription.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(remainingLessons !== undefined && { remainingLessons: parseInt(remainingLessons) }),
                ...(usedFreezes !== undefined && { usedFreezes: parseInt(usedFreezes) }),
                ...(remainingLessons !== undefined && { status: isExpired ? 'EXPIRED' : 'ACTIVE' }),
            },
            include: {
                child: { select: { id: true, firstName: true, lastName: true } },
                clubService: {
                    include: {
                        club: { select: { id: true, name: true } },
                    },
                },
                payment: { select: { id: true, amount: true } },
            },
        });

        if (isExpired) {
            const pendingSubscription = await prisma.subscription.findFirst({
                where: {
                    clubId: subscription.clubId,
                    childId: subscription.childId,
                    status: 'PENDING',
                },
            });

            const activeSubscriptionCount = await prisma.subscription.count({
                where: {
                    clubId: subscription.clubId,
                    childId: subscription.childId,
                    status: 'ACTIVE',
                },
            });

            let date = new Date()
            date = new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate() + 1,
                0, 0, 0, 0
            ));

            if (pendingSubscription && activeSubscriptionCount === 0) {
                await prisma.subscription.update({
                    where: { id: pendingSubscription.id },
                    data: { status: 'ACTIVE', startDate: date },
                });
            }
        }

        res.json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        const subscriptionId = parseInt(req.params.id);

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: 'CANCELLED', endDate: new Date() },
        });

        const pendingSubscription = await prisma.subscription.findFirst({
            where: {
                clubId: subscription.clubId,
                childId: subscription.childId,
                status: 'PENDING',
            },
        });

        const activeSubscriptionCount = await prisma.subscription.count({
            where: {
                clubId: subscription.clubId,
                childId: subscription.childId,
                status: 'ACTIVE',
            },
        });

        let date = new Date()
        date = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + 1,
            0, 0, 0, 0
        ));

        if (pendingSubscription && activeSubscriptionCount === 0) {
            await prisma.subscription.update({
                where: { id: pendingSubscription.id },
                data: { status: 'ACTIVE', startDate: date },
            });
        }

        res.json({ success: true, message: 'Subscription is cancelled' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const sub = await prisma.subscription.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        await prisma.subscription.delete({
            where: { id: parseInt(req.params.id) },
        });

        const pendingSubscription = await prisma.subscription.findFirst({
            where: {
                clubId: sub.clubId,
                childId: sub.childId,
                status: 'PENDING',
            },
        });

        const activeSubscriptionCount = await prisma.subscription.count({
            where: {
                clubId: sub.clubId,
                childId: sub.childId,
                status: 'ACTIVE',
            },
        });

        let date = new Date()
        date = new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate() + 1,
            0, 0, 0, 0
        ));

        if (pendingSubscription && activeSubscriptionCount === 0) {
            await prisma.subscription.update({
                where: { id: pendingSubscription.id },
                data: { status: 'ACTIVE', startDate: date },
            });
        }

        res.json({ success: true, message: 'Subscription is deleted' });
    } catch (error) {
        next(error);
    }
};