const paymentModel = require('../model/payment');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await paymentModel.getAll(req.user, req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const payment = await paymentModel.getById(parseInt(req.params.id));
        res.json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const payment = await paymentModel.create(req.body);
        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const payment = await paymentModel.update(parseInt(req.params.id), req.body);
        res.json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        await paymentModel.remove(parseInt(req.params.id));
        res.json({ success: true, message: 'Payment is deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getStats = async (req, res, next) => {
    try {
        const data = await paymentModel.getStats(req.query);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
