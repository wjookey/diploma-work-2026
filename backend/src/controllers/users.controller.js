const userModel = require('../model/user');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await userModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const user = await userModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const user = await userModel.create(req.user, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const user = await userModel.update(parseInt(req.params.id), req.user, req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await userModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'User is deleted' });
    } catch (error) {
        next(error);
    }
};
