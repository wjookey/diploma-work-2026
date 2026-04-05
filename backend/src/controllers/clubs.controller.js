const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, classCategoryId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (classCategoryId) {
            where.classCategoryId = parseInt(classCategoryId);
        }
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const [clubs, total] = await Promise.all([
            prisma.club.findMany({
                where,
                include: {
                    clubCategory: { select: { id: true, name: true, description: true } },
                    teacher: {
                        include: {
                            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                        }
                    },
                },
                orderBy: { name: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.club.count({ where }),
        ]);

        res.json({
            success: true,
            data: clubs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const club = await prisma.club.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                clubCategory: { select: { id: true, name: true, description: true } },
                teacher: {
                    include: {
                        user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                    }
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

        if (!club) throw new AppError('Club is not found', 404);

        res.json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, description, classCategoryId, defaultTeacherId, maxStudents } = req.body;

        const club = await prisma.club.create({
            data: {
                name,
                description,
                classCategoryId: parseInt(classCategoryId),
                defaultTeacherId: parseInt(defaultTeacherId),
                maxStudents: maxStudents ? parseInt(maxStudents) : null,
            },
            include: {
                clubCategory: { select: { id: true, name: true } },
                teacher: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    }
                },
            },
        });

        res.status(201).json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { name, description, classCategoryId, defaultTeacherId, maxStudents, isActive } = req.body;

        const club = await prisma.club.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(classCategoryId && { classCategoryId: parseInt(classCategoryId) }),
                ...(defaultTeacherId && { defaultTeacherId: parseInt(defaultTeacherId) }),
                ...(maxStudents !== undefined && { maxStudents: maxStudents ? parseInt(maxStudents) : null }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                clubCategory: { select: { id: true, name: true } },
                teacher: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    }
                },
            },
        });

        res.json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.club.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Club is deleted' });
    } catch (error) {
        next(error);
    }
}; 