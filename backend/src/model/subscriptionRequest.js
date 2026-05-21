const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
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
    subscription: { select: { id: true, status: true } },
};

const assertParentRole = (user, message) => {
    if (user.role !== 'PARENT') {
        throw new AppError(message, 403);
    }
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

const buildListWhere = (user, query) => {
    const { childId, clubServiceId, clubId, status } = query;
    const where = {};

    if (childId) where.childId = parseInt(childId);
    if (clubServiceId) where.clubServiceId = parseInt(clubServiceId);
    if (clubId) {
        where.clubService = {};
        where.clubService.clubId = parseInt(clubId);
    }
    if (status) where.status = status;
    if (user.role === 'PARENT') where.familyId = user.parent.familyId;

    return where;
};

const validateParentChild = async (childId, familyId) => {
    const child = await prisma.child.findUnique({
        where: { id: parseInt(childId), familyId },
    });

    if (!child) {
        throw new AppError('Ребёнок не найден', 404);
    }

    return child;
};

exports.getAll = async (user, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(user, query);

    const [subscriptionRequests, total] = await Promise.all([
        prisma.subscriptionRequest.findMany({
            where,
            include: listInclude,
            orderBy: { createdAt: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.subscriptionRequest.count({ where }),
    ]);

    return {
        data: subscriptionRequests,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
        where: { id },
        include: {
            child: true,
            clubService: true,
        },
    });

    if (!subscriptionRequest) {
        throw new AppError('Заявка не найдена', 404);
    }

    return subscriptionRequest;
};

exports.create = async (user, { childId, clubServiceId, message }) => {
    assertParentRole(user, 'Only parents are allowed to submit requests');

    await validateParentChild(childId, user.parent.familyId);

    const clubService = await prisma.clubService.findUnique({
        where: { id: parseInt(clubServiceId) },
    });

    if (!clubService) {
        throw new AppError('Услуга не найдена', 404);
    }

    return prisma.subscriptionRequest.create({
        data: {
            familyId: user.parent.familyId,
            childId: parseInt(childId),
            clubServiceId: parseInt(clubServiceId),
            message,
        },
        include: createInclude,
    });
};

exports.createCombo = async (user, { requests }) => {
    assertParentRole(user, 'Only parents are allowed to submit requests');

    return prisma.$transaction(async (tx) => {
        const createdRequests = [];

        for (const request of requests) {
            const child = await tx.child.findUnique({
                where: { id: parseInt(request.childId), familyId: user.parent.familyId },
            });

            if (!child) {
                throw new AppError('Ребёнок не найден', 404);
            }

            const clubService = await tx.clubService.findUnique({
                where: { id: parseInt(request.clubServiceId) },
            });

            if (!clubService) {
                throw new AppError('Услуга не найдена', 404);
            }

            const createdRequest = await tx.subscriptionRequest.create({
                data: {
                    familyId: user.parent.familyId,
                    childId: parseInt(request.childId),
                    clubServiceId: parseInt(request.clubServiceId),
                    message: request.message,
                },
            });

            createdRequests.push(createdRequest);
        }

        return createdRequests;
    });
};

exports.update = async (id, user, { clubServiceId, childId }) => {
    assertParentRole(user, 'Only parents are allowed to change requests');

    await validateParentChild(childId, user.parent.familyId);

    return prisma.subscriptionRequest.update({
        where: { id },
        data: {
            ...(clubServiceId && { clubServiceId }),
            ...(childId && { childId }),
        },
        include: updateInclude,
    });
};

exports.approve = async (id) => {
    const request = await prisma.subscriptionRequest.findUnique({
        where: { id },
        include: {
            clubService: true,
        },
    });

    if (!request) {
        throw new AppError('Заявка не найдена', 404);
    }

    if (request.status !== 'PENDING') {
        throw new AppError('Заявка уже обработана', 400);
    }

    const activeSubscription = await prisma.subscription.findFirst({
        where: {
            clubId: request.clubService.clubId,
            childId: request.childId,
            status: 'ACTIVE',
        },
    });

    const date = getNextStartDate();

    await prisma.$transaction([
        prisma.subscription.create({
            data: {
                childId: request.childId,
                clubId: request.clubService.clubId,
                clubServiceId: request.clubServiceId,
                remainingLessons: request.clubService.subscriptionLessons,
                startDate: activeSubscription ? null : date,
                status: activeSubscription ? 'PENDING' : 'ACTIVE',
            },
        }),
        prisma.subscriptionRequest.update({
            where: { id },
            data: { status: 'APPROVED' },
        }),
    ]);
};

exports.reject = async (id) => {
    const request = await prisma.subscriptionRequest.findUnique({
        where: { id },
    });

    if (!request) {
        throw new AppError('Заявка не найдена', 404);
    }

    if (request.status !== 'PENDING') {
        throw new AppError('Заявка уже обработана', 400);
    }

    await prisma.subscriptionRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
    });
};

exports.remove = async (id, user) => {
    assertParentRole(user, 'Only parents are allowed to remove requests');

    const request = await prisma.subscriptionRequest.findUnique({
        where: { id },
    });

    if (!request) {
        throw new AppError('Заявка не найдена', 404);
    }

    if (request.status !== 'PENDING') {
        throw new AppError('Вы не можете удалить уже обработанную заявку', 400);
    }

    await prisma.subscriptionRequest.delete({
        where: { id },
    });
};
