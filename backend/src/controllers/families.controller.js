const familyModel = require('../model/family');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await familyModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const family = await familyModel.getById(parseInt(req.params.id), req.user);
        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const family = await familyModel.create(req.body);
        res.status(201).json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const family = await familyModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: family });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await familyModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Family is deleted' });
    } catch (error) {
        next(error);
    }
};
