const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

const clubWithDetailsInclude = {
    club: {
        include: {
            clubCategory: true,
            teacher: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                },
            },
        },
    },
};

const createInclude = {
    club: { select: { id: true, name: true } },
};

const buildListWhere = ({ search, clubId, type, isActive }) => {
    const where = {};

    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (clubId) where.clubId = parseInt(clubId);
    if (type) where.type = type;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { club: { name: { contains: search, mode: 'insensitive' } } },
            { club: { clubCategory: { name: { contains: search, mode: 'insensitive' } } } },
        ];
    }

    return where;
};

exports.getAll = async (query) => {
    const { search, clubId, type, isActive, page = 1, limit = 20 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = buildListWhere({ search, clubId, type, isActive });

    const [clubServices, total] = await Promise.all([
        prisma.clubService.findMany({
            where,
            include: clubWithDetailsInclude,
            orderBy: { name: 'asc' },
            skip,
            take: parseInt(limit),
        }),
        prisma.clubService.count({ where }),
    ]);

    return {
        data: clubServices,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    };
};

exports.getById = async (id) => {
    const clubService = await prisma.clubService.findUnique({
        where: { id },
        include: clubWithDetailsInclude,
    });

    if (!clubService) {
        throw new AppError('Услуга не найдена', 404);
    }

    return clubService;
};

exports.create = async (body) => {
    const { name, price, subscriptionLessons, freezedLesson, clubId, type, isCombo } = body;

    const club = await prisma.club.findUnique({
        where: { id: parseInt(clubId) },
    });

    if (!club) {
        throw new AppError('Кружок не найден', 404);
    }

    return prisma.clubService.create({
        data: {
            name,
            price: parseFloat(price),
            subscriptionLessons: parseInt(subscriptionLessons),
            freezedLesson: freezedLesson ? parseInt(freezedLesson) : 0,
            clubId: parseInt(clubId),
            type,
            isCombo,
        },
        include: createInclude,
    });
};

exports.update = async (id, body) => {
    const { name, price, subscriptionLessons, freezedLesson, type, isCombo } = body;

    return prisma.clubService.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(price && { price: parseFloat(price) }),
            ...(subscriptionLessons && { subscriptionLessons: parseInt(subscriptionLessons) }),
            ...(freezedLesson !== undefined && { freezedLesson: parseInt(freezedLesson) }),
            ...(type && { type }),
            ...(isCombo !== undefined && { isCombo }),
        },
        include: createInclude,
    });
};

exports.updateStatus = async (id, { isActive }) => {
    await prisma.clubService.update({
        where: { id },
        data: { isActive },
    });
};

exports.remove = async (id) => {
    const currentSubscriptions = await prisma.subscription.count({
        where: {
            clubServiceId: id,
            status: 'ACTIVE' || 'PENDING',
        },
    });

    if (currentSubscriptions !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данной услуге привязаны абонементы', 409);
    }

    const currentRequests = await prisma.subscriptionRequest.count({
        where: {
            clubServiceId: id,
            status: 'PENDING',
        },
    });

    if (currentRequests !== 0) {
        throw new AppError('Вы не можете совершить это действие, так как к данной услуге привязаны заявки', 409);
    }

    await prisma.clubService.delete({
        where: { id },
    });
};
