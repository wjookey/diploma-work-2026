const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, clubId, type, isActive, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

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

        const [clubServices, total] = await Promise.all([
            prisma.clubService.findMany({
                where,
                include: {
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
                },
                orderBy: { name: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.clubService.count({ where }),
        ]);

        res.json({
            success: true,
            data: clubServices,
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
        const clubService = await prisma.clubService.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
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
            },
        });

        if (!clubService) throw new AppError('Услуга не найдена', 404);

        res.json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, price, subscriptionLessons, freezedLesson, clubId, type } = req.body;

        const club = await prisma.club.findUnique({
            where: { id: parseInt(clubId) },
        });

        if (!club) {
            throw new AppError('Кружок не найден', 404);
        }

        const clubService = await prisma.clubService.create({
            data: {
                name,
                price: parseFloat(price),
                subscriptionLessons: parseInt(subscriptionLessons),
                freezedLesson: freezedLesson ? parseInt(freezedLesson) : 0,
                clubId: parseInt(clubId),
                type,
            },
            include: {
                club: { select: { id: true, name: true } },
            },
        });

        res.status(201).json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { name, price, subscriptionLessons, freezedLesson, type } = req.body;

        const clubService = await prisma.clubService.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(name && { name }),
                ...(price && { price: parseFloat(price) }),
                ...(subscriptionLessons && { subscriptionLessons: parseInt(subscriptionLessons) }),
                ...(freezedLesson !== undefined && { freezedLesson: parseInt(freezedLesson) }),
                ...(type && { type }),
            },
            include: {
                club: { select: { id: true, name: true } },
            },
        });

        res.json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        await prisma.clubService.update({
            where: { id: parseInt(req.params.id) },
            data: { isActive },
        });

        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const currentSubscriptions = await prisma.subscription.count({
            where: {
                clubServiceId: parseInt(req.params.id),
                status: "ACTIVE" || 'PENDING',
            },
        });

        if (currentSubscriptions !== 0) throw new AppError('Вы не можете совершить это действие, так как к данной услуге привязаны абонементы', 409);

        const currentRequests = await prisma.subscriptionRequest.count({
            where: {
                clubServiceId: parseInt(req.params.id),
                status: 'PENDING',
            },
        });

        if (currentRequests !== 0) throw new AppError('Вы не можете совершить это действие, так как к данной услуге привязаны заявки', 409);

        await prisma.clubService.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Club service is deleted' });
    } catch (error) {
        next(error);
    }
};

