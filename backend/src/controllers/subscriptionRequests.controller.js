const subscriptionRequestModel = require('../model/subscriptionRequest');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await subscriptionRequestModel.getAll(req.user, req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const subscriptionRequest = await subscriptionRequestModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const subscriptionRequest = await subscriptionRequestModel.create(req.user, req.body);
        res.status(201).json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.createCombo = async (req, res, next) => {
    try {
        const data = await subscriptionRequestModel.createCombo(req.user, req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const subscriptionRequest = await subscriptionRequestModel.update(
            parseInt(req.params.id),
            req.user,
            req.body
        );
        res.json({ success: true, data: subscriptionRequest });
    } catch (error) {
        next(error);
    }
};

exports.approve = async (req, res, next) => {
    try {
        await subscriptionRequestModel.approve(parseInt(req.params.id));
        res.json({ success: true, message: 'Request is approved, subscription is created' });
    } catch (error) {
        next(error);
    }
};

exports.reject = async (req, res, next) => {
    try {
        await subscriptionRequestModel.reject(parseInt(req.params.id));
        res.json({ success: true, message: 'Request is rejected' });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await subscriptionRequestModel.remove(parseInt(req.params.id), req.user);
        res.json({ success: true, message: 'Subscription request is deleted' });
    } catch (error) {
        next(error);
    }
};
