const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');
const { AppError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authorization is required', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                teacher: { select: { id: true } },
                parent: { select: { id: true } },
            },
        });

        if (!user || !user.isActive) {
            throw new AppError('User is not fount or deactivated', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
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