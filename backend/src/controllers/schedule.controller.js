const scheduleModel = require('../model/schedule');

exports.getAll = async (req, res, next) => {
    try {
        const schedule = await scheduleModel.getAll();
        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const schedule = await scheduleModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const schedule = await scheduleModel.create(req.body);
        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const schedule = await scheduleModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: schedule });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await scheduleModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Schedule is deleted' });
    } catch (error) {
        next(error);
    }
};

exports.generateLessons = async (req, res, next) => {
    try {
        const count = await scheduleModel.generateLessons(req.body);
        res.status(201).json({
            success: true,
            message: `Created ${count} lessons`,
            data: { count },
        });
    } catch (error) {
        next(error);
    }
};
