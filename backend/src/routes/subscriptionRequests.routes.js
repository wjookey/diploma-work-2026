const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/subscriptionRequests.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('PARENT'),
    [
        body('childId').notEmpty().withMessage('Enter the child'),
        body('clubServiceId').notEmpty().withMessage('Enter the club service'),
    ],
    validate,
    controller.create
);
router.post(
    '/combo',
    authorize('PARENT'),
    [
        body('requests').isArray({ min: 2, max: 2 }).withMessage('request must be an array of 2 objects'),
        body('requests.*.childId').notEmpty().withMessage('Enter the child'),
        body('requests.*.clubServiceId').notEmpty().withMessage('Enter the club service'),
    ],
    validate,
    controller.createCombo
);
router.put('/:id', authorize('PARENT'), controller.update);
router.put('/:id/approve', authorize('ADMIN'), controller.approve);
router.put('/:id/reject', authorize('ADMIN'), controller.reject);
router.delete('/:id', authorize('PARENT'), controller.remove);

module.exports = router;