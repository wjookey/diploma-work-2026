const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { search, familyId, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (req.user.role === 'PARENT') {
            where.familyId = req.user.parent.familyId;
        } else if (familyId) {
            where.familyId = parseInt(familyId);
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [children, total] = await Promise.all([
            prisma.child.findMany({
                where,
                include: {
                    family: {
                        include: {
                            parents: {
                                include: {
                                    user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                                },
                            },
                        },
                    },
                    subscriptions: {
                        where: { status: 'ACTIVE' },
                        include: {
                            club: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { firstName: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.child.count({ where }),
        ]);

        res.json({
            success: true,
            data: children,
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
        const child = await prisma.child.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                family: {
                    include: {
                        parents: {
                            include: {
                                user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                            },
                        },
                    },
                },
                subscriptions: {
                    include: {
                        club: { select: { id: true, name: true } },
                        payment: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                attendances: {
                    include: {
                        lesson: {
                            include: {
                                club: { select: { id: true, name: true } },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!child) throw new AppError('Child is not found', 404);

        if (req.user.role === 'PARENT' && child.familyId !== req.user.parent.familyId) {
            throw new AppError('Forbidden', 403);
        }

        res.json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { firstName, lastName, birthDate, familyId, note } = req.body;

        const child = await prisma.child.create({
            data: {
                firstName,
                lastName,
                birthDate: birthDate ? new Date(birthDate) : null,
                familyId: req.user.role === 'PARENT' ? req.user.parent.familyId : parseInt(familyId),
                note,
            },
            include: {
                family: {
                    include: {
                        parents: {
                            include: {
                                user: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
            },
        });

        res.status(201).json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { firstName, lastName, birthDate, note, familyId } = req.body;

        const child = await prisma.child.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
                ...(note !== undefined && { note }),
                ...(familyId && { familyId: parseInt(familyId) }),
            },
        });

        res.json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.child.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'Record is deleted' });
    } catch (error) {
        next(error);
    }
};