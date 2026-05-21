const attendanceModel = require('../model/attendance');

exports.getAll = async (req, res, next) => {
    try {
        const { data, pagination } = await attendanceModel.getAll(req.query);
        res.json({ success: true, data, pagination });
    } catch (error) {
        next(error);
    }
};

exports.getByLesson = async (req, res, next) => {
    try {
        const lesson = await attendanceModel.getByLesson(parseInt(req.params.lessonId));
        res.json({ success: true, data: lesson });
    } catch (error) {
        next(error);
    }
};

exports.markAttendance = async (req, res, next) => {
    try {
        const data = await attendanceModel.markAttendance({
            lessonId: req.body.lessonId,
            attendances: req.body.attendances,
            user: req.user,
        });
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
