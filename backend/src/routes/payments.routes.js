const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/payments.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', authorize('ADMIN'), controller.getById);
router.get('/stats', authorize('ADMIN'), controller.getStats);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('subscriptionId').notEmpty().withMessage('Выберите абонемент для оплаты'),
        body('paymentDate').optional().isISO8601().withMessage('Дата должна быть в формате YYYY-MM-DD'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;
