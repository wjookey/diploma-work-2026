const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
    parents: {
        include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        },
    },
    children: {
        include: {
            subscriptions: {
                include: {
                    clubService: {
                        include: { club: true },
                    },
                },
            },
        },
    },
};

const detailInclude = {
    parents: {
        include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        },
    },
    children: {
        include: {
            subscriptions: {
                include: {
                    clubService: {
                        include: { club: true },
                    },
                },
            },
        },
    },
};

const createResultInclude = {
    parents: {
        include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
        },
    },
    children: { select: { firstName: true, lastName: true, birthDate: true, note: true } },
};

const buildListWhere = (search) => {
    const where = {};

    if (search) {
        where.OR = [
            { familyName: { contains: search, mode: 'insensitive' } },
            { parents: { some: { user: { phone: { contains: search, mode: 'insensitive' } } } } },
            { parents: { some: { user: { email: { contains: search, mode: 'insensitive' } } } } },
        ];
    }

    return where;
};

exports.getAll = async (query) => {
    const { search, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(search);

    const [families, total] = await Promise.all([
        prisma.family.findMany({
            where,
            include: listInclude,
            orderBy: { familyName: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.family.count({ where }),
    ]);

    return {
        data: families,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id, user) => {
    const family = await prisma.family.findUnique({
        where: { id },
        include: detailInclude,
    });

    if (!family) {
        throw new AppError('Семья не найдена', 404);
    }

    if (user.role === 'PARENT' && family.id !== user.parent.familyId) {
        throw new AppError('Forbidden', 403);
    }

    return family;
};

exports.create = async ({ familyName, parents, children }) => {
    const result = await prisma.$transaction(async (tx) => {
        const createdFamily = await tx.family.create({
            data: { familyName },
        });

        const createdParents = [];
        for (const parent of parents) {
            const createdUser = await tx.user.create({
                data: {
                    email: parent.user.email,
                    firstName: parent.user.firstName,
                    lastName: parent.user.lastName,
                    phone: parent.user.phone,
                    role: 'PARENT',
                },
            });

            const createdParent = await tx.parent.create({
                data: {
                    userId: createdUser.id,
                    familyId: createdFamily.id,
                },
            });

            createdParents.push({ user: createdUser, parent: createdParent });
        }

        const createdChildren = await Promise.all(
            children.map((child) =>
                tx.child.create({
                    data: {
                        firstName: child.firstName,
                        lastName: child.lastName,
                        birthDate: child.birthDate ? new Date(child.birthDate) : null,
                        familyId: createdFamily.id,
                        note: child.note || null,
                    },
                })
            )
        );

        return {
            family: createdFamily,
            parents: createdParents,
            children: createdChildren,
        };
    });

    return prisma.family.findUnique({
        where: { id: result.family.id },
        include: createResultInclude,
    });
};

exports.update = async (id, { familyName }) => {
    return prisma.family.update({
        where: { id },
        data: {
            ...(familyName && { familyName }),
        },
    });
};

exports.remove = async (id) => {
    await prisma.$transaction(async (tx) => {
        const family = await tx.family.findUnique({
            where: { id },
            include: {
                parents: true,
                children: true,
            },
        });

        if (!family) {
            throw new AppError('Семья не найдена', 404);
        }

        const userIds = family.parents.map((p) => p.userId);

        if (userIds.length > 0) {
            await tx.user.deleteMany({
                where: { id: { in: userIds } },
            });
        }

        await tx.family.delete({ where: { id } });
    });
};
