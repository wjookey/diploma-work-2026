const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { generateVerificationCode, sendVerificationCode } = require('../services/emailService');
const { verifyByHash } = require('../services/telegramAuthService');

const generateToken = (userId, tokenType) => {
    const jwtSecret = tokenType === "access" ? config.jwtAccessSecret : config.jwtRefreshSecret;
    const jwtExpiresIn = tokenType === "access" ? config.jwtAccessExpiresIn : config.jwtRefreshExpiresIn;
    const token = jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });

    return token;
};

const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

const hashCode = (code) => {
    return crypto.createHash('sha256').update(code).digest('hex');
};

exports.telegramAuthAuto = async (req, res, next) => {
    try {
        const { initData } = req.body;
        const botToken = config.botToken;
        
        verifyByHash(initData, botToken);

        const urlParams = new URLSearchParams(initData);
        const userJson = urlParams.get('user');
        const telegramUser = JSON.parse(userJson);

        let user = await prisma.user.findUnique({
            where: { telegramId: String(telegramUser.id) },
            include: {
                teacher: true,
                parent: {
                    include: {
                        family: {
                            include: {
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new AppError('Пользователь не найден', 404);
        }

        const accessToken = generateToken(user.id, "access");
        const refreshToken = generateToken(user.id, "refresh");

        user = await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashToken(refreshToken) },
        });

        const { password: _, verificationCode: __, codeExpiresAt: ___, ...userData } = user;

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

exports.requestCode = async (req, res, next) => {
    try {
        const { email, firstName, lastName, phone, familyName } = req.body;

        const code = generateVerificationCode();
        const hashedCode = hashCode(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                teacher: true,
                parent: {
                    include: {
                        family: {
                            include: {
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            if (firstName !== '' && lastName !== '' && phone !== '' && familyName !== '') {
                const famName = familyName;
                user = await prisma.user.create({
                    data: {
                        firstName,
                        lastName,
                        email,
                        phone,
                        role: 'PARENT',
                        verificationCode: hashedCode,
                        codeExpiresAt: expiresAt,
                        parent: {
                            create: {
                                family: {
                                    create: {
                                        familyName: famName,
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        parent: {
                            include: {
                                family: {
                                    include: {
                                        children: true,
                                    },
                                },
                            },
                        },
                    },
                });
            } else {
                throw new AppError('Пользователь не найден', 404);
            }
        } else {
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationCode: hashedCode,
                    codeExpiresAt: expiresAt,
                },
                include: {
                    teacher: true,
                    parent: {
                        include: {
                            family: {
                                include: {
                                    children: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        await sendVerificationCode(email, code);

        res.json({
            succes: true,
            message: "Verification code has been sent to email",
            ...(process.env.NODE_ENV === 'development' && { debugCode: code }),
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyCode = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                teacher: true,
                parent: {
                    include: {
                        family: {
                            include: {
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new AppError('Пользователь не найден. Запросите код заново.', 404);
        }

        const hashedInputCode = hashCode(code);
        const isValidCode = user.verificationCode === hashedInputCode;
        const isNotExpired = user.codeExpiresAt && user.codeExpiresAt > new Date();

        if (!isValidCode) {
            throw new AppError('Неверный код подтверждения', 422);
        }
        
        if (!isNotExpired) {
            throw new AppError('Код подтверждения истек. Запросите новый код.', 410);
        }

        const updateData = {
            verificationCode: null,
            codeExpiresAt: null,
        };

        if (req.body.initData) {
            try {
                const botToken = config.botToken;
                verifyByHash(req.body.initData, botToken);

                const urlParams = new URLSearchParams(req.body.initData);
                const userJson = urlParams.get('user');
                const telegramUser = JSON.parse(userJson);

                const existingUserWithTg = await prisma.user.findUnique({
                    where: { telegramId: String(telegramUser.id) },
                });

                if (existingUserWithTg && existingUserWithTg.id !== user.id) {
                    throw new AppError('Этот Telegram аккаунт уже привязан к другому пользователю', 409);
                }

                updateData.telegramId = String(telegramUser.id);
            } catch (error) {
                console.warn('Ошибка привязки Telegram: ', error.message);
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            include: {
                teacher: true,
                parent: {
                    include: {
                        family: {
                            include: {
                                children: true,
                            },
                        },
                    },
                },
            },
        });

        const accessToken = generateToken(user.id, "access");
        const refreshToken = generateToken(user.id, "refresh");

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: hashToken(refreshToken) },
        });

        const { password: _, verificationCode: __, codeExpiresAt: ___, ...userData } = updatedUser;

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

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Необходим токен обновления', 401);
        }

        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || !user.refreshToken) {
            throw new AppError('Некорректный токен обновления', 401);
        }

        const hashedIncomingToken = hashToken(refreshToken);

        if (hashedIncomingToken !== user.refreshToken) {
            throw new AppError('Некорректный токен обновления', 401);
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