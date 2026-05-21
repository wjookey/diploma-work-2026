const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const config = require('../config');
const { AppError } = require('../middleware/errorHandler');
const { generateVerificationCode, sendVerificationCode } = require('../services/emailService');
const { verifyByHash } = require('../services/telegramAuthService');

const userWithRelationsInclude = {
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
};

const getMeSelect = {
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
};

const generateToken = (userId, tokenType) => {
    const jwtSecret = tokenType === 'access' ? config.jwtAccessSecret : config.jwtRefreshSecret;
    const jwtExpiresIn = tokenType === 'access' ? config.jwtAccessExpiresIn : config.jwtRefreshExpiresIn;
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};

const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

const hashCode = (code) =>
    crypto.createHash('sha256').update(code).digest('hex');

const stripSensitiveUser = (user) => {
    const { password: _, verificationCode: __, codeExpiresAt: ___, ...userData } = user;
    return userData;
};

const issueAuthTokens = async (userId) => {
    const accessToken = generateToken(userId, 'access');
    const refreshToken = generateToken(userId, 'refresh');

    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: hashToken(refreshToken) },
    });

    return { accessToken, refreshToken };
};

const parseTelegramUser = (initData) => {
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    return JSON.parse(userJson);
};

const resolveTelegramLinkUpdate = async (initData, userId) => {
    const updateData = {};

    try {
        verifyByHash(initData, config.botToken);
        const telegramUser = parseTelegramUser(initData);

        const existingUserWithTg = await prisma.user.findUnique({
            where: { telegramId: String(telegramUser.id) },
        });

        if (existingUserWithTg && existingUserWithTg.id !== userId) {
            throw new AppError('Этот Telegram аккаунт уже привязан к другому пользователю', 409);
        }

        updateData.telegramId = String(telegramUser.id);
    } catch (error) {
        console.warn('Ошибка привязки Telegram: ', error.message);
    }

    return updateData;
};

exports.telegramAuthAuto = async (initData) => {
    verifyByHash(initData, config.botToken);

    const telegramUser = parseTelegramUser(initData);

    let user = await prisma.user.findUnique({
        where: { telegramId: String(telegramUser.id) },
        include: userWithRelationsInclude,
    });

    if (!user) {
        throw new AppError('Пользователь не найден', 404);
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user.id);

    user = await prisma.user.findUnique({
        where: { id: user.id },
        include: userWithRelationsInclude,
    });

    return {
        user: stripSensitiveUser(user),
        accessToken,
        refreshToken,
    };
};

exports.requestCode = async ({ email, firstName, lastName, phone, familyName }) => {
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await prisma.user.findUnique({
        where: { email },
        include: userWithRelationsInclude,
    });

    if (!user) {
        if (firstName !== '' && lastName !== '' && phone !== '' && familyName !== '') {
            await prisma.user.create({
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
                                    familyName,
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
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationCode: hashedCode,
                codeExpiresAt: expiresAt,
            },
        });
    }

    await sendVerificationCode(email, code);

    return {
        message: 'Verification code has been sent to email',
        debugCode: process.env.NODE_ENV === 'development' ? code : undefined,
    };
};

exports.verifyCode = async ({ email, code, initData }) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: userWithRelationsInclude,
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

    if (initData) {
        const telegramUpdate = await resolveTelegramLinkUpdate(initData, user.id);
        Object.assign(updateData, telegramUpdate);
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        include: userWithRelationsInclude,
    });

    const { accessToken, refreshToken } = await issueAuthTokens(user.id);

    return {
        user: stripSensitiveUser(updatedUser),
        accessToken,
        refreshToken,
    };
};

exports.getMe = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId },
        select: getMeSelect,
    });
};

exports.refreshToken = async (refreshToken) => {
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

    const accessToken = generateToken(user.id, 'access');
    const newRefreshToken = generateToken(user.id, 'refresh');

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashToken(newRefreshToken) },
    });

    return { accessToken, refreshToken: newRefreshToken };
};

exports.logout = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
    });
};
