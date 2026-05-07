const config = require('../config');

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Внутренняя ошибка сервера";

    // Prisma errors handler
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'Запись с введёнными данными уже существует';
    }
    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'Запись не найдена';
    }

    // JWT errors handler
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authorization token';
    }
    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token is expired';
    }

    if (config.nodeEnv === 'development') {
        console.error(`Error: ${err}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
};

module.exports = { AppError, errorHandler };