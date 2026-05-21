const lessonModel = require('../model/lesson');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await lessonModel.getAll(req.user, req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const lesson = await lessonModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const lesson = await lessonModel.create(req.body);
        res.status(201).json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.createWeekLessons = async (req, res, next) => {
    try {
        const count = await lessonModel.createWeekLessons(req.body);
        res.status(201).json({
            success: true,
            message: `${count} is created`,
            data: count,
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const lesson = await lessonModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        await lessonModel.updateStatus(parseInt(req.params.id), req.body);
        res.json({ success: true, message: 'Status is updated' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await lessonModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Lesson is deleted' });
    } catch (error) {
        next(error);
    }
};
