require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default-secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-secret',
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    nodeEnv: process.env.NODE_ENV || 'development'
}