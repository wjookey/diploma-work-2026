const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/schedule.controller');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    [
        body('clubId').notEmpty().withMessage('Enter the club'),
        body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('Enter the day of week from 1 to 7'),
        body('startTime').notEmpty().withMessage('Enter the start time'),
        body('endTime').notEmpty().withMessage('Enter the end time'),
    ],
    validate,
    controller.create
);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post(
    '/lessons/generate',
    [
        body('startDate').notEmpty().withMessage('Enter the start time'),
        body('endDate').notEmpty().withMessage('Enter the end time'),
    ],
    validate,
    controller.generateLessons
);

module.exports = router;