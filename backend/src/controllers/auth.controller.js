const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (userId, tokenType) => {
    const jwtSecret = tokenType === "access" ? config.jwtAccessSecret : config.jwtRefreshSecret;
    const jwtExpiresIn = tokenType === "access" ? config.jwtAccessExpiresIn : config.jwtRefreshExpiresIn;
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });

    return token;
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                teacher: { select: { id: true } },
                parent: {
                    include: {
                        family: {
                            include: {
                                children: { select: { id: true, firstName: true, lastName: true, birthDate: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new AppError('Incorrect email or password', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Incorrect email or password', 401);
        }

        const accessToken = generateToken(user.id, "access");
        const refreshToken = generateToken(user.id, "refresh");
        
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashToken(refreshToken) },
        });

        const { password: _, ...userData } = user;

        res.json({
            success: true,
            data: {
                user: userData,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('User already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: 'PARENT',
                parent: { create: { family: { create: { familyName: lastName } } } },
            },
            include: {
                parent: { select: { id: true, family: { select: { id: true,  familyName: true } } } },
            },
        });

        const accessToken = generateToken(user.id, "access");
        const refreshToken = generateToken(user.id, "refresh");

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashToken(refreshToken) },
        });

        const { password: _, ...userData } = user;

        res.status(201).json({
            success: true,
            data: {
                user: userData,
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

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
                    include: {
                        family: {
                            include: {
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

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh Token is required', 401);
        }

        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || !user.refreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        const hashedIncomingToken = hashToken(refreshToken);

        if (hashedIncomingToken !== user.refreshToken) {
            throw new AppError('Invalid refresh token', 401);
        }

        const accessToken = generateToken(user.id, "access");
        const newRefreshToken = generateToken(user.id, "refresh");
        
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashToken(newRefreshToken) },
        });

        res.json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null },
        });

        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        next(error);
    }
};