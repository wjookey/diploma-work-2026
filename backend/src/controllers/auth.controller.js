const authModel = require('../model/auth');

exports.telegramAuthAuto = async (req, res, next) => {
    try {
        const data = await authModel.telegramAuthAuto(req.body.initData);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.requestCode = async (req, res, next) => {
    try {
        const { message, debugCode } = await authModel.requestCode(req.body);
        res.json({
            success: true,
            message,
            ...(debugCode && { debugCode }),
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyCode = async (req, res, next) => {
    try {
        const data = await authModel.verifyCode(req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res, next) => {
    try {
        const user = await authModel.getMe(req.user.id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const data = await authModel.refreshToken(req.body.refreshToken);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await authModel.logout(req.user.id);
        res.json({ success: true, message: 'Logged out' });
    } catch (error) {
        next(error);
    }
};
