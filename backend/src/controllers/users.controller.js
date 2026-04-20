const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

exports.getAll = async (req, res, next) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (role) where.role = role;

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    createdAt: true,
                    teacher: {
                        select: {
                            id: true,
                            specialty: true,
                            clubs: {
                                select: { id: true, name: true },
                            },
                        }
                    },
                    parent: {
                        select: {
                            id: true,
                            family: {
                                select: {
                                    id: true,
                                    familyName: true,
                                    children: {
                                        select: { id: true, firstName: true, lastName: true, birthDate: true }
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: users,
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
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                teacher: {
                    select: {
                        id: true,
                        specialty: true,
                        bio: true,
                        clubs: {
                            select: { id: true, name: true },
                        },
                    },
                },
                parent: {
                    select: {
                        id: true,
                        family: {
                            select: {
                                id: true,
                                familyName: true,
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) throw new AppError('User is not found', 404);

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone, role, specialty, bio, familyId } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        const data = {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role: role,
        };

        if (role === 'TEACHER') {
            data.teacher = { create: { specialty, bio } };
        }

        if (role === 'PARENT') {
            data.parent = {
                create: {
                    family: {
                        connect: {
                            id: req.user.role === 'PARENT' ? req.user.parent.familyId : parseInt(familyId),
                        },
                    },
                }
            };
        }

        const user = await prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                teacher: { select: { id: true } },
                parent: { select: { id: true } },
            },
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const { firstName, lastName, phone, email, specialty, bio, familyId } = req.body;
        const userId = parseInt(req.params.id);

        if (req.user.role === 'PARENT') {
            const parent = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    parent: true,
                }
            });

            if (req.user.parent.familyId !== parent.parent.familyId) throw new AppError('Forbidden', 403);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone !== undefined && { phone }),
                ...(email && { email }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                teacher: { select: { id: true } },
                parent: { select: { id: true } },
            },
        });

        if (user.role === 'TEACHER' && user.teacher && (specialty !== undefined || bio !== undefined)) {
            await prisma.teacher.update({
                where: { id: user.teacher.id },
                data: {
                    ...(specialty !== undefined && { specialty }),
                    ...(bio !== undefined && { bio }),
                },
            });
        }

        if (user.role === 'PARENT' && user.parent) {
            await prisma.parent.update({
                where: { id: user.parent.id },
                data: {
                    ...(familyId && { familyId: parseInt(familyId) }),
                },
            });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await prisma.user.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ success: true, message: 'User is deleted' });
    } catch (error) {
        next(error);
    }
};