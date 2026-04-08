const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { childId, clubId, clubServiceId, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (childId) where.childId = parseInt(childId);
        if (clubId) where.clubId = parseInt(clubId);
        if (clubServiceId) where.clubServiceId = parseInt(clubServiceId);
        if (status) where.status = status;

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                include: {
                    child: { select: { id: true, firstName: true, lastName: true } },
                    clubService: {
                        include: {
                            club: { select: { id: true, name: true } },
                        },
                    },
                    payment: { select: { id: true, amount: true } },
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

        if (!subscription) throw new AppError('Subscription is not found', 404);

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
            throw new AppError('Club service is not found', 404);
        }

        const activeSubscriptionCount = await prisma.subscription.count({
            where: { childId: parseInt(childId), clubId: clubService.clubId, status: 'ACTIVE' },
        });

        let date = new Date();
        date = new Date(new Date(date.setDate(date.getDate() + 1)).setHours(0, 0, 0, 0));

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

exports.update = async (req, res, next) => {
    try {
        const { remainingLessons, usedFreezes } = req.body;

        const isExpired = parseInt(remainingLessons) === 0 ? true : false;

        const subscription = await prisma.subscription.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(remainingLessons !== undefined && { remainingLessons: parseInt(remainingLessons) }),
                ...(usedFreezes !== undefined && { usedFreezes: parseInt(usedFreezes) }),
                ...(remainingLessons !== undefined && {status: isExpired ? 'EXPIRED' : 'ACTIVE'}),
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

        let date = new Date();
        date = new Date(new Date(date.setDate(date.getDate() + 1)).setHours(0, 0, 0, 0));

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
        await prisma.subscription.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Subscription is deleted' });
    } catch (error) {
        next(error);
    }
};