const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (search) {
            where.OR = [
                { familyName: { contains: search, mode: 'insensitive' } },
                { parents: { some: { user: { phone: { contains: search, mode: 'insensitive' } } } } },
                { parents: { some: { user: { email: { contains: search, mode: 'insensitive' } } } } }
            ];
        }

        const [families, total] = await Promise.all([
            prisma.family.findMany({
                where,
                include: {
                    parents: {
                        include: {
                            user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                        },
                    },
                    children: {
                        include: {
                            subscriptions: {
                                include: {
                                    clubService: {
                                        include: { club: true },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { familyName: 'asc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.family.count({ where }),
        ]);

        res.json({
            success: true,
            data: families,
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
        const family = await prisma.family.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                parents: {
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                    },
                },
                children: {
                    include: {
                        subscriptions: {
                            include: {
                                clubService: {
                                    include: { club: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!family) throw new AppError('Семья не найдена', 404);

        if (req.user.role === 'PARENT' && family.id !== req.user.parent.familyId) {
            throw new AppError('Forbidden', 403);
        }

        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { familyName, parents, children } = req.body;

        const result = await prisma.$transaction(async (tx) => {
            const createdFamily = await tx.family.create({
                data: { familyName },
            });

            const createdParents = [];
            for (const parent of parents) {

                const createdUser = await tx.user.create({
                    data: {
                        email: parent.user.email,
                        firstName: parent.user.firstName,
                        lastName: parent.user.lastName,
                        phone: parent.user.phone,
                        role: 'PARENT',
                    },
                });

                const createdParent = await tx.parent.create({
                    data: {
                        userId: createdUser.id,
                        familyId: createdFamily.id,
                    },
                });

                createdParents.push({ user: createdUser, parent: createdParent });
            }

            const createdChildren = await Promise.all(
                children.map(child =>
                    tx.child.create({
                        data: {
                            firstName: child.firstName,
                            lastName: child.lastName,
                            birthDate: child.birthDate ? new Date(child.birthDate) : null,
                            familyId: createdFamily.id,
                            note: child.note || null,
                        },
                    })
                )
            );

            return {
                family: createdFamily,
                parents: createdParents,
                children: createdChildren,
            };
        });

        const family = await prisma.family.findUnique({
            where: { id: result.family.id },
            include: {
                parents: {
                    include: {
                        user: { select: { firstName: true, lastName: true, phone: true, email: true } },
                    },
                },
                children: { select: { firstName: true, lastName: true, birthDate: true, note: true } },
            },
        });

        res.status(201).json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { familyName } = req.body;

        const family = await prisma.family.update({
            where: { id: parseInt(req.params.id) },
            data: {
                ...(familyName && { familyName }),
            },
        });

        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.$transaction(async (tx) => {
            const family = await tx.family.findUnique({
                where: { id: parseInt(req.params.id) },
                include: {
                    parents: true,
                    children: true,
                },
            });

            if (!family) throw new AppError('Семья не найдена', 404);

            const userIds = family.parents.map((p) => p.userId);

            if (userIds.length > 0) {
                await tx.user.deleteMany({
                    where: { id: { in: userIds } },
                });
            }

            await tx.family.delete({ where: { id: parseInt(req.params.id) } });
        });

        res.json({ success: true, message: 'Family is deleted' });
    } catch (error) {
        next(error);
    }
};