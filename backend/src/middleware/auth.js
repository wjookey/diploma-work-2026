const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { AppError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Необходима авторизация', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtAccessSecret);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                teacher: { select: { id: true } },
                parent: { select: { id: true, familyId: true } },
            },
        });

        if (!user) {
            throw new AppError('Пользователь не найден', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Токен истёк', 401));
        }
        return next(new AppError('Некорректный токен', 401));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You are not allowed to do this action', 403));
        }
        next();
    };
};

module.exports = { authenticate, authorize };