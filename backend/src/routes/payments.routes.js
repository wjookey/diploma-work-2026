const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/payments.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/stats', authorize('ADMIN'), controller.getStats);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('subscriptionId').notEmpty().withMessage('Enter subscription'),
        body('paymentDate').optional().isISO8601().withMessage('Enter correct payment date (YYYY-MM-DD)'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;
