const clubServiceModel = require('../model/clubService');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await clubServiceModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const clubService = await clubServiceModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const clubService = await clubServiceModel.create(req.body);
        res.status(201).json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const clubService = await clubServiceModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: clubService });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        await clubServiceModel.updateStatus(parseInt(req.params.id), req.body);
        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await clubServiceModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Club service is deleted' });
    } catch (error) {
        next(error);
    }
};
