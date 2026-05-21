const dashboardModel = require('../model/dashboard');

exports.getStats = async (req, res, next) => {
    try {
        const data = await dashboardModel.getStats();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

exports.getRecentActivity = async (req, res, next) => {
    try {
        const data = await dashboardModel.getRecentActivity();
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
