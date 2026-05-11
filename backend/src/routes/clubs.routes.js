const { Router } = require('express');
const { body } = require('express-validator');
const validator = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/clubs.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('name').notEmpty().withMessage('Введите название кружка').trim(),
        body('description').optional().isString().withMessage('Описание должно быть строкой').trim(),
        body('classCategoryId').toInt().isInt({ gt: 0 }).withMessage('ID категории должно быть положительным числом'),
        body('defaultTeacherId').optional({ checkFalsy: true }).toInt().isInt({ gt: 0 }).withMessage('ID учителя должно быть положительным числом'),
        body('maxStudents').if((value) => value !== null && value !== '').toInt().isInt({ min: 0 }).withMessage('Максимальное число детей должно быть положительным числом'),
    ],
    validator,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;