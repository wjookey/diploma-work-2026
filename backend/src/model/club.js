const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const listInclude = {
    clubCategory: { select: { id: true, name: true, description: true, isActive: true } },
    teacher: {
        include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
        },
    },
};

const createUpdateInclude = {
    clubCategory: { select: { id: true, name: true } },
    teacher: {
        include: {
            user: { select: { firstName: true, lastName: true } },
        },
    },
};

const buildListWhere = ({ search, classCategoryId, isActive }) => {
    const where = {};

    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    if (classCategoryId) {
        where.classCategoryId = parseInt(classCategoryId);
    }
    if (search) {
        where.name = { contains: search, mode: 'insensitive' };
    }

    return where;
};

exports.getAll = async (query) => {
    const { search, classCategoryId, isActive, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere({ search, classCategoryId, isActive });

    const [clubs, total] = await Promise.all([
        prisma.club.findMany({
            where,
            include: listInclude,
            orderBy: { name: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.club.count({ where }),
    ]);

    return {
        data: clubs,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const club = await prisma.club.findUnique({
        where: { id },
        include: {
            clubCategory: { select: { id: true, name: true, description: true } },
            teacher: {
                include: {
                    user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                },
            },
            clubServices: {
                select: { id: true, name: true, price: true, subscriptionLessons: true, type: true },
            },
            lessons: {
                where: { date: { gte: new Date() } },
                orderBy: { date: 'asc' },
                take: 10,
                select: { id: true, date: true, startTime: true, endTime: true, status: true },
            },
            subscriptions: {
                where: { status: 'ACTIVE' },
                select: { id: true, child: { select: { id: true, firstName: true, lastName: true } } },
            },
        },
    });

    if (!club) {
        throw new AppError('Кружок не найден', 404);
    }

    return club;
};

exports.create = async (body) => {
    const { name, description, classCategoryId, defaultTeacherId, maxStudents, dayClasses } = body;

    return prisma.club.create({
        data: {
            name,
            description,
            classCategoryId: parseInt(classCategoryId),
            defaultTeacherId: dayClasses ? null : parseInt(defaultTeacherId),
            dayClasses,
            maxStudents: maxStudents ? parseInt(maxStudents) : null,
        },
        include: createUpdateInclude,
    });
};

exports.update = async (id, body) => {
    const { name, description, classCategoryId, defaultTeacherId, maxStudents, isActive, dayClasses } = body;

    return prisma.club.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
            ...(classCategoryId && { classCategoryId: parseInt(classCategoryId) }),
            ...(defaultTeacherId && { defaultTeacherId: parseInt(defaultTeacherId) }),
            ...(maxStudents !== undefined && { maxStudents: maxStudents ? parseInt(maxStudents) : null }),
            ...(isActive !== undefined && { isActive }),
            ...(dayClasses !== undefined && { dayClasses }),
            ...(dayClasses && { defaultTeacherId: null }),
        },
        include: createUpdateInclude,
    });
};

exports.updateStatus = async (id, { isActive }) => {
    await prisma.club.update({
        where: { id },
        data: { isActive },
    });
};

exports.remove = async (id) => {
    const currentSubscriptions = await prisma.subscription.count({
        where: {
            clubId: id,
            status: 'ACTIVE' || 'PENDING',
        },
    });

    if (currentSubscriptions !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данному кружку привязаны абонементы', 409);
    }

    const currentRequests = await prisma.subscriptionRequest.count({
        where: {
            clubService: {
                clubId: id,
            },
            status: 'PENDING',
        },
    });

    if (currentRequests !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данному кружку привязаны заявки', 409);
    }

    await prisma.club.delete({
        where: { id },
    });
};
