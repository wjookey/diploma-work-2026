const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/lessons.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', authorize('ADMIN', 'PARENT'), controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('clubId').isInt({ gt: 0 }).withMessage('ID кружка должно быть положительным числом'),
        body('date').notEmpty().withMessage('date is required').isISO8601().withMessage('Дата должна быть в формате YYYY-MM-DD'),
        body('startTime').notEmpty().withMessage('startTime is required').isString().withMessage('Время начала должно быть строкой'),
        body('endTime').notEmpty().withMessage('endTime is required').isString().withMessage('Время конца должно быть строкой'),
        body('room').optional().isString().withMessage('Кабинет должен быть строкой'),
        body('topic').optional().isString().withMessage('Тема занятия должна быть строкой'),
        body('assignedTeacherId').optional().isInt({ gt: 0 }).withMessage('ID учителя должно быть положительным числом'),
    ],
    validate,
    controller.create
);
router.post(
    '/week',
    authorize('ADMIN'),
    [
        body('weekSchedule').isArray({ min: 7, max: 7 }).withMessage('Расписание на неделю должно включать ровно 7 дней'),
        body('weekSchedule.*').isArray().withMessage('Каждый день должен быть массивом занятий'),
        body('weekSchedule.*.*.clubId').isInt({ gt: 0 }).withMessage('ID кружка должно быть положительным числом'),
        body('weekSchedule.*.*.date').notEmpty().withMessage('date is required').isISO8601().withMessage('Дата должна быть в формате YYYY-MM-DD'),
        body('weekSchedule.*.*.startTime').notEmpty().withMessage('startTime is required').isString().withMessage('Время начала должно быть строкой'),
        body('weekSchedule.*.*.endTime').notEmpty().withMessage('endTime is required').isString().withMessage('Время конца должно быть строкой'),
        body('weekSchedule.*.*.room').optional().isString().withMessage('Кабинет должен быть строкой'),
        body('weekSchedule.*.*.topic').optional().isString().withMessage('Тема занятия должна быть строкой'),
        body('weekSchedule.*.*.assignedTeacherId').optional().isInt({ gt: 0 }).withMessage('ID учителя должно быть положительным числом'),
    ],
    validate,
    controller.createWeekLessons
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;