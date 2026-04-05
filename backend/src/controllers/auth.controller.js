const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                teacher: { select: { id: true } },
                parent: { select: { id: true } },
            },
        });

        if (!user) {
            throw new AppError('Incorrect email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Incorrect email or password', 401);
        }

        const token = generateToken(user.id);

        const { password: _, ...userData } = user;

        res.json({
            success: true,
            data: {
                user: userData,
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// exports.register = async (req, res, next) => {
//     try {
//         const { email, password, firstName, lastName, phone } = req.body;

//         const existingUser = await prisma.user.findUnique({ where: { email } });
//         if (existingUser) {
//             throw new AppError('User already exists', 409);
//         }

//         const hashedPassword = await bcrypt.hash(password, 12);

//         const user = await prisma.user.create({
//             data: {
//                 email,
//                 password: hashedPassword,
//                 firstName,
//                 lastName,
//                 phone,
//                 role: 'PARENT',
//                 parent: { create: { family: { create: { familyName: lastName } } } },
//             },
//             include: {
//                 parent: { select: { id: true, family: { select: { id: true,  familyName: true } } } },
//             },
//         });

//         const token = generateToken(user.id);
//         const { password: _, ...userData } = user;

//         res.status(201).json({
//             success: true,
//             data: {
//                 user: userData,
//                 token,
//             },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

exports.getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                teacher: { select: { id: true, specialty: true, bio: true } },
                parent: {
                    select: {
                        id: true,
                        family: {
                            select: {
                                id: true,
                                children: { select: { id: true, firstName: true, lastName: true, birthDate: true } },
                            },
                        },
                    },
                },
            },
        });

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new AppError('Incorrect current password', 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });

        res.json({ success: true, message: 'Password is changed successfully' });
    } catch (error) {
        next(error);
    }
};