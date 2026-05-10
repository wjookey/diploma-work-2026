const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/clubServices.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('name').notEmpty().withMessage('Введите название услуги').trim(),
        body('price').isFloat({ gte: 0 }).withMessage('Цена за услугу должна быть больше или равна 0'),
        body('subscriptionLessons').isInt({ min: 0 }).withMessage('Количество занятий должно быть неотрицательным числом'),
        body('freezedLesson').isInt({ min: 0 }).withMessage('Количество заморозок должно быть неотрицательным числом'),
        body('clubId').isInt({ gt: 0 }).withMessage('ID кружка должно быть положительным числом'),
        body('type').isIn(['TRIAL', 'SINGLE', 'SUBSCRIPTION', 'CAMP', 'AFTERSCHOOL']).withMessage('Неизвестный тип услуги'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;

