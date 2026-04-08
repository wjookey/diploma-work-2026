const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/subscriptionRequests.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
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
router.put('/:id', authorize('PARENT'), controller.update);
router.put('/:id/approve', authorize('ADMIN'), controller.approve);
router.put('/:id/reject', authorize('ADMIN'), controller.reject);
router.delete('/:id', authorize('PARENT'), controller.remove);

module.exports = router;