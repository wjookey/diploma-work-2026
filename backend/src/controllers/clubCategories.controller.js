const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

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
                totalPage: Math.ceil(total / parseInt(limit)),
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

        if (!clubCategory) throw new AppError('Category is not found', 404);

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

exports.remove = async (req, res, next) => {
    try {
        await prisma.clubCategory.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: "Record is deleted" });
    } catch (error) {
        next(error);
    }
};