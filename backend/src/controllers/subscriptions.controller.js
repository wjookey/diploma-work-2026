const subscriptionModel = require('../model/subscription');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await subscriptionModel.getAll(req.user, req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const subscription = await subscriptionModel.getById(parseInt(req.params.id), req.user);
        res.json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const subscription = await subscriptionModel.create(req.body);
        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.createCombo = async (req, res, next) => {
    try {
        const data = await subscriptionModel.createCombo(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const subscription = await subscriptionModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

exports.cancel = async (req, res, next) => {
    try {
        await subscriptionModel.cancel(parseInt(req.params.id));
        res.json({ success: true, message: 'Subscription is cancelled' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await subscriptionModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Subscription is deleted' });
    } catch (error) {
        next(error);
    }
};
