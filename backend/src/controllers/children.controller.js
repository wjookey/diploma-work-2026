const childModel = require('../model/child');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await childModel.getAll(req.user, req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const child = await childModel.getById(parseInt(req.params.id), req.user);
        res.json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const child = await childModel.create(req.user, req.body);
        res.status(201).json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const child = await childModel.update(parseInt(req.params.id), req.user, req.body);
        res.json({ success: true, data: child });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await childModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Record is deleted' });
    } catch (error) {
        next(error);
    }
};
