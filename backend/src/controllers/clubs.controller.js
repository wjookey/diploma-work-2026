const clubModel = require('../model/club');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await clubModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const club = await clubModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const club = await clubModel.create(req.body);
        res.status(201).json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const club = await clubModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: club });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        await clubModel.updateStatus(parseInt(req.params.id), req.body);
        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await clubModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Club is deleted' });
    } catch (error) {
        next(error);
    }
};
