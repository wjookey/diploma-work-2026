const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/schedule.controller');

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'TEACHER'), controller.getAll);
router.get('/:id', authorize('ADMIN'), controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('clubId').notEmpty().withMessage('Enter the club'),
        body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Enter the day of week from 1 to 7'),
        body('startTime').notEmpty().withMessage('Enter the start time'),
        body('endTime').notEmpty().withMessage('Enter the end time'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);
router.post(
    '/lessons/generate',
    [
        body('startDate').isISO8601().withMessage('Enter the start time'),
        body('endDate').isISO8601().withMessage('Enter the end time'),
    ],
    validate,
    controller.generateLessons
);

module.exports = router;