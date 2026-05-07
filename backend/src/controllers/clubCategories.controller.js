const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, isActive, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [clubCategories, total] = await Promise.all([
            prisma.clubCategory.findMany({
                where,
                include: {
                    clubs: { select: { name: true, description: true } },
                },
                orderBy: { name: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.clubCategory.count({ where }),
        ]);

        res.json({
            success: true,
            data: clubCategories,
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
        const clubCategory = await prisma.clubCategory.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                clubs: { select: { name: true, description: true } },
            },
        });

        if (!clubCategory) throw new AppError('Категория не найдена', 404);

        res.json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const clubCategory = await prisma.clubCategory.create({
            data: {
                name,
                description
            },
        });

        res.status(201).json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const clubCategory = await prisma.clubCategory.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(name && { name }),
                ...(description && { description }),
            },
        });

        res.json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        await prisma.clubCategory.update({
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
                club: {
                    classCategoryId: parseInt(req.params.id),
                },
                status: 'ACTIVE' || 'PENDING',
            },
        });

        if (currentSubscriptions !== 0) throw new AppError('Вы не можете совершить это действие, так как к данной категории привязаны абонементы', 409);
        
        const currentRequests = await prisma.subscriptionRequest.count({
            where: {
                clubService: {
                    club: { classCategoryId: parseInt(req.params.id) },
                },
                status: 'PENDING',
            },
        });

        if (currentRequests !== 0) throw new AppError('Вы не можете совершить это действие, так как к данной категории привязаны заявки', 409);

        await prisma.clubCategory.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: "Record is deleted" });
    } catch (error) {
        next(error);
    }
};