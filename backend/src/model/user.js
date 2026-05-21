const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    createdAt: true,
    teacher: {
        select: {
            id: true,
            specialty: true,
            clubs: {
                select: { id: true, name: true },
            },
        },
    },
    parent: {
        select: {
            id: true,
            family: {
                select: {
                    id: true,
                    familyName: true,
                    children: {
                        select: { id: true, firstName: true, lastName: true, birthDate: true },
                    },
                },
            },
        },
    },
};

const detailSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    createdAt: true,
    teacher: {
        select: {
            id: true,
            specialty: true,
            bio: true,
            clubs: {
                select: { id: true, name: true },
            },
        },
    },
    parent: {
        select: {
            id: true,
            family: {
                select: {
                    id: true,
                    familyName: true,
                    children: true,
                },
            },
        },
    },
};

const createSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    createdAt: true,
    teacher: { select: { id: true } },
    parent: { select: { id: true } },
};

const updateSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    teacher: { select: { id: true } },
    parent: { select: { id: true } },
};

const buildListWhere = ({ role, search }) => {
    const where = {};

    if (role) where.role = role;

    if (search) {
        where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
        ];
    }

    return where;
};

const buildCreateData = (creatorUser, body) => {
    const { email, firstName, lastName, phone, role, specialty, bio, familyId } = body;

    const data = {
        email,
        firstName,
        lastName,
        phone,
        role,
    };

    if (role === 'TEACHER') {
        data.teacher = { create: { specialty, bio } };
    }

    if (role === 'PARENT') {
        data.parent = {
            create: {
                family: {
                    connect: {
                        id: creatorUser.role === 'PARENT'
                            ? creatorUser.parent.familyId
                            : parseInt(familyId),
                    },
                },
            },
        };
    }

    return data;
};

const assertParentCanUpdate = async (userId, creatorUser) => {
    const parent = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            parent: true,
        },
    });

    if (creatorUser.parent.familyId !== parent.parent.familyId) {
        throw new AppError('Forbidden', 403);
    }
};

const assertTeacherCanUpdate = async (userId, creatorUser) => {
    const teacher = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (creatorUser.id !== teacher.id) {
        throw new AppError('Forbidden', 403);
    }
};

exports.getAll = async (query) => {
    const { page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere(query);

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: listSelect,
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.user.count({ where }),
    ]);

    return {
        data: users,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: detailSelect,
    });

    if (!user) {
        throw new AppError('Пользователь не найден', 404);
    }

    return user;
};

exports.create = async (creatorUser, body) => {
    return prisma.user.create({
        data: buildCreateData(creatorUser, body),
        select: createSelect,
    });
};

exports.update = async (id, creatorUser, body) => {
    const { firstName, lastName, phone, email, specialty, bio, familyId } = body;

    if (creatorUser.role === 'PARENT') {
        await assertParentCanUpdate(id, creatorUser);
    }

    if (creatorUser.role === 'TEACHER') {
        await assertTeacherCanUpdate(id, creatorUser);
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(phone !== undefined && { phone }),
            ...(email && { email }),
        },
        select: updateSelect,
    });

    if (user.role === 'TEACHER' && user.teacher && (specialty !== undefined || bio !== undefined)) {
        await prisma.teacher.update({
            where: { id: user.teacher.id },
            data: {
                ...(specialty !== undefined && { specialty }),
                ...(bio !== undefined && { bio }),
            },
        });
    }

    if (user.role === 'PARENT' && user.parent) {
        await prisma.parent.update({
            where: { id: user.parent.id },
            data: {
                ...(familyId && { familyId: parseInt(familyId) }),
            },
        });
    }

    return user;
};

exports.remove = async (id) => {
    await prisma.user.delete({
        where: { id },
    });
};
