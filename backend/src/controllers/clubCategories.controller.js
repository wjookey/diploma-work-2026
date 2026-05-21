const clubCategoryModel = require('../model/clubCategory');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await clubCategoryModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const clubCategory = await clubCategoryModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const clubCategory = await clubCategoryModel.create(req.body);
        res.status(201).json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const clubCategory = await clubCategoryModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: clubCategory });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        await clubCategoryModel.updateStatus(parseInt(req.params.id), req.body);
        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await clubCategoryModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Record is deleted' });
    } catch (error) {
        next(error);
    }
};
