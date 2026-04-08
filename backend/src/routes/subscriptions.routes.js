const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/subscriptions.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('childId').notEmpty().withMessage('Enter the child'),
        body('clubServiceId').notEmpty().withMessage('Enter the club service'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/cancel', authorize('ADMIN'), controller.cancel);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;