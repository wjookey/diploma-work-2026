const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, clubId, type, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (clubId) where.clubId = parseInt(clubId);
        if (type) where.type = type;
        if (search) where.name = { contains: search, mode: 'insensitive' };

        const [clubServices, total] = await Promise.all([
            prisma.clubService.findMany({
                where,
                include: {
                    club: { select: { id: true, name: true } },
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
                club: { select: { id: true, name: true, description: true } },
                subscriptions: {
                    include: {
                        child: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
                subscriptionRequests: {
                    include: {
                        child: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });

        if (!clubService) throw new AppError('Club service is not found', 404);

        res.json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, price, subscriptionLessons, freezedLesson, clubId, type } = req.body;

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

exports.remove = async (req, res, next) => {
    try {
        await prisma.clubService.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Club service is deleted' });
    } catch (error) {
        next(error);
    }
};

