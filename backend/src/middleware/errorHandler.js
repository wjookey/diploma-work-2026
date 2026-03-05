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
    let message = err.message || "Internal server error";

    // Prisma errors handler
    if (err.code === 'P2002') {
        statusCode = 409;
        message = 'The record with given data already exists';
    }
    if (err.code === 'P2025') {
        statusCode = 404;
        message = 'The record is not foung';
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