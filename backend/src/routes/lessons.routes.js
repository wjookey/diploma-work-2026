const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/lessons.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('clubId').isInt({ gt: 0 }).withMessage('clubId must be a positive integer'),
        body('date').notEmpty().withMessage('date is required').isISO8601().withMessage('date must be in ISO8601 format'),
        body('startTime').notEmpty().withMessage('startTime is required').isString().withMessage('startTime must be a string'),
        body('endTime').notEmpty().withMessage('endTime is required').isString().withMessage('endTime must be a string'),
        body('room').optional().isString().withMessage('room must be a string'),
        body('topic').optional().isString().withMessage('topic must be a string'),
        body('assignedTeacherId').optional().isInt({ gt: 0 }).withMessage('assignedTeacherId must be a positive integer'),
    ],
    validate,
    controller.create
);
router.post(
    '/week',
    authorize('ADMIN'),
    [
        body('weekSchedule').isArray({ min: 7, max: 7 }).withMessage('weekSchedule must be an array of exactly 7 arrays'),
        body('weekSchedule.*').isArray().withMessage('Each day must be an array of lessons'),
        body('weekSchedule.*.*.clubId').isInt({ gt: 0 }).withMessage('clubId must be a positive integer'),
        body('weekSchedule.*.*.date').notEmpty().withMessage('date is required').isISO8601().withMessage('date must be in ISO8601 format'),
        body('weekSchedule.*.*.startTime').notEmpty().withMessage('startTime is required').isString().withMessage('startTime must be a string'),
        body('weekSchedule.*.*.endTime').notEmpty().withMessage('endTime is required').isString().withMessage('endTime must be a string'),
        body('weekSchedule.*.*.room').optional().isString().withMessage('room must be a string'),
        body('weekSchedule.*.*.topic').optional().isString().withMessage('topic must be a string'),
        body('weekSchedule.*.*.assignedTeacherId').optional().isInt({ gt: 0 }).withMessage('assignedTeacherId must be a positive integer'),
    ],
    validate,
    controller.createWeekLessons
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;