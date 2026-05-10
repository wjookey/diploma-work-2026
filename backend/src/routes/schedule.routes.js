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
        body('clubId').notEmpty().withMessage('Выберите кружок'),
        body('dayOfWeek').isInt({ min: 1, max: 7 }).withMessage('День недели может быть в диапазоне [1, 7]'),
        body('startTime').notEmpty().withMessage('Введите время начала'),
        body('endTime').notEmpty().withMessage('Введите время конца'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);
router.post(
    '/lessons/generate',
    [
        body('startDate').isISO8601().withMessage('Введите дату начала'),
        body('endDate').isISO8601().withMessage('Введите дату конца'),
    ],
    validate,
    controller.generateLessons
);

module.exports = router;