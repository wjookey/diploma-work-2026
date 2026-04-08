const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { childId, clubServiceId, clubId, status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (childId) where.childId = parseInt(childId);
        if (clubServiceId) where.clubServiceId = parseInt(clubServiceId);
        if (clubId) {
            where.clubService = {};
            where.clubService.clubId = parseInt(clubId);
        }
        if (status) where.status = status;

        if (req.user.role === 'PARENT') where.familyId = req.user.parent.familyId;

        const [subscriptionRequests, total] = await Promise.all([
            prisma.subscriptionRequest.findMany({
                where,
                include: {
                    family: {
                        include: {
                            parents: {
                                include: {
                                    user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                                },
                            },
                        },
                    },
                    child: { select: { id: true, firstName: true, lastName: true } },
                    clubService: {
                        include: {
                            club: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.subscriptionRequest.count({ where }),
        ]);

        res.json({
            success: true,
            data: subscriptionRequests,
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
        const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                child: true,
                clubService: true,
            },
        });

        if (!subscriptionRequest) throw new AppError('Request is not found', 404);

        res.json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { childId, clubServiceId, message } = req.body;

        if (req.user.role !== 'PARENT') {
            throw new AppError('Only parents are allowed to submit requests', 403);
        }

        const child = await prisma.child.findUnique({
            where: { id: parseInt(childId), familyId: req.user.parent.familyId },
        });

        if (!child) throw new AppError('Child is not found', 404);

        const clubService = await prisma.clubService.findUnique({
            where: { id: parseInt(clubServiceId) },
        });

        if (!clubService) throw new AppError('Club service is not found', 404);

        const subscriptionRequest = await prisma.subscriptionRequest.create({
            data: {
                familyId: req.user.parent.familyId,
                childId: parseInt(childId),
                clubServiceId: parseInt(clubServiceId),
                message,
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

        res.status(201).json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.createCombo = async (req, res, next) => {
    try {
        const { requests } = req.body;

        if (req.user.role !== 'PARENT') {
            throw new AppError('Only parents are allowed to submit requests', 403);
        }

        const result = await prisma.$transaction(async (tx) => {
            const createdRequests = [];

            for (const request of requests) {
                const child = await tx.child.findUnique({
                    where: { id: parseInt(request.childId), familyId: req.user.parent.familyId },
                });

                if (!child) throw new AppError('Child is not found', 404);

                const clubService = await tx.clubService.findUnique({
                    where: { id: parseInt(request.clubServiceId) },
                });

                if (!clubService) throw new AppError('Club service is not found', 404);

                const createdRequest = await tx.subscriptionRequest.create({
                    data: {
                        familyId: req.user.parent.familyId,
                        childId: parseInt(request.childId),
                        clubServiceId: parseInt(request.clubServiceId),
                        message: request.message,
                    },
                });

                createdRequests.push(createdRequest);
            }

            return createdRequests;
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

exports.update = async (req, res, next) => {
    try {
        const { clubServiceId, childId } = req.body;

        if (req.user.role !== 'PARENT') {
            throw new AppError('Only parents are allowed to change requests', 403);
        }

        const child = await prisma.child.findUnique({
            where: { id: parseInt(childId), familyId: req.user.parent.familyId },
        });

        if (!child) throw new AppError('Child is not found', 404);

        const subscriptionRequest = await prisma.subscriptionRequest.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(clubServiceId && { clubServiceId }),
                ...(childId && { childId }),
            },
            include: {
                child: { select: { id: true, firstName: true, lastName: true } },
                clubService: {
                    include: {
                        club: { select: { id: true, name: true } },
                    },
                },
                subscription: { select: { id: true, status: true } },
            },
        });

        res.json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.approve = async (req, res, next) => {
    try {
        const requestId = parseInt(req.params.id);

        const request = await prisma.subscriptionRequest.findUnique({
            where: { id: requestId },
            include: {
                clubService: true,
            },
        });

        if (!request) throw new AppError('Request is not found', 404);

        if (request.status !== 'PENDING') throw new AppError('Request is already processed', 400);

        const activeSubscription = await prisma.subscription.findFirst({
            where: {
                clubId: request.clubService.clubId,
                childId: request.childId,
                status: 'ACTIVE',
            },
        });

        let date = new Date();
        date = new Date(new Date(date.setDate(date.getDate() + 1)).setHours(0, 0, 0, 0));

        await prisma.$transaction([
            prisma.subscription.create({
                data: {
                    childId: request.childId, 
                    clubId: request.clubService.clubId,
                    clubServiceId: request.clubServiceId,
                    remainingLessons: request.clubService.subscriptionLessons,
                    startDate: activeSubscription ? null : date,
                    status: activeSubscription ? 'PENDING' : 'ACTIVE',
                }
            }),
            prisma.subscriptionRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' },
            }),
        ]);

        res.json({ success: true, message: 'Request is approved, subscription is created' });
    } catch(error) {
        next(error);
    }
};

exports.reject = async (req, res, next) => {
    try {
        const requestId = parseInt(req.params.id);

        await prisma.subscriptionRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });
        
        res.json({ success: true, message: 'Request is rejected' });
    } catch (error) {
        next(error);
    }
}

exports.remove = async (req, res, next) => {
    try {
        if (req.user.role !== 'PARENT') {
            throw new AppError('Only parents are allowed to remove requests', 403);
        }

        await prisma.subscriptionRequest.delete({
            where: { id: parseInt(req.params.id), status: 'PENDING' },
        });

        res.json({ success: true, message: 'Subscription request is deleted' });
    } catch (error) {
        next(error);
    }
};