const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const clubsSelectInclude = {
    clubs: { select: { name: true, description: true } },
};

const buildListWhere = ({ search, isActive }) => {
    const where = {};

    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
        ];
    }

    return where;
};

exports.getAll = async (query) => {
    const { search, isActive, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere({ search, isActive });

    const [clubCategories, total] = await Promise.all([
        prisma.clubCategory.findMany({
            where,
            include: clubsSelectInclude,
            orderBy: { name: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.clubCategory.count({ where }),
    ]);

    return {
        data: clubCategories,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const clubCategory = await prisma.clubCategory.findUnique({
        where: { id },
        include: clubsSelectInclude,
    });

    if (!clubCategory) {
        throw new AppError('Категория не найдена', 404);
    }

    return clubCategory;
};

exports.create = async ({ name, description }) => {
    return prisma.clubCategory.create({
        data: {
            name,
            description,
        },
    });
};

exports.update = async (id, { name, description }) => {
    return prisma.clubCategory.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(description !== undefined && { description }),
        },
    });
};

exports.updateStatus = async (id, { isActive }) => {
    await prisma.clubCategory.update({
        where: { id },
        data: { isActive },
    });
};

exports.remove = async (id) => {
    const currentSubscriptions = await prisma.subscription.count({
        where: {
            club: {
                classCategoryId: id,
            },
            status: 'ACTIVE' || 'PENDING',
        },
    });

    if (currentSubscriptions !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данной категории привязаны абонементы', 409);
    }

    const currentRequests = await prisma.subscriptionRequest.count({
        where: {
            clubService: {
                club: { classCategoryId: id },
            },
            status: 'PENDING',
        },
    });

    if (currentRequests !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данной категории привязаны заявки', 409);
    }

    await prisma.clubCategory.delete({
        where: { id },
    });
};
