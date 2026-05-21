const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const familyWithParentsInclude = {
    family: {
        include: {
            parents: {
                include: {
                    user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                },
            },
        },
    },
};

const createInclude = {
    family: {
        include: {
            parents: {
                include: {
                    user: { select: { firstName: true, lastName: true } },
                },
            },
        },
    },
};

const buildListWhere = (user, query) => {
    const { search, familyId } = query;
    const where = {};

    if (user.role === 'PARENT') {
        where.familyId = user.parent.familyId;
    } else if (familyId) {
        where.familyId = parseInt(familyId);
    }

    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
        ];
    }

    return where;
};

exports.getAll = async (user, query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(user, query);

    const [children, total] = await Promise.all([
        prisma.child.findMany({
            where,
            include: {
                ...familyWithParentsInclude,
                subscriptions: {
                    where: { status: 'ACTIVE' },
                    include: {
                        club: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { firstName: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.child.count({ where }),
    ]);

    return {
        data: children,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id, user) => {
    const child = await prisma.child.findUnique({
        where: { id },
        include: {
            ...familyWithParentsInclude,
            subscriptions: {
                include: {
                    club: { select: { id: true, name: true } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            attendances: {
                include: {
                    lesson: {
                        include: {
                            club: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            },
        },
    });

    if (!child) {
        throw new AppError('Ребёнок не найден', 404);
    }

    if (user.role === 'PARENT' && child.familyId !== user.parent.familyId) {
        throw new AppError('Forbidden', 403);
    }

    return child;
};

exports.create = async (user, body) => {
    const { firstName, lastName, birthDate, familyId, note } = body;

    return prisma.child.create({
        data: {
            firstName,
            lastName,
            birthDate: birthDate ? new Date(birthDate) : null,
            familyId: user.role === 'PARENT' ? user.parent.familyId : parseInt(familyId),
            note,
        },
        include: createInclude,
    });
};

exports.update = async (id, user, body) => {
    const { firstName, lastName, birthDate, note, familyId } = body;

    if (user.role === 'PARENT') {
        const childCheck = await prisma.child.findUnique({
            where: { id },
        });

        if (user.parent.familyId !== childCheck.familyId) {
            throw new AppError('Forbidden', 403);
        }
    }

    return prisma.child.update({
        where: { id },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
            ...(note !== undefined && { note }),
            ...(familyId && { familyId: parseInt(familyId) }),
        },
    });
};

exports.remove = async (id) => {
    await prisma.child.delete({
        where: { id },
    });
};
