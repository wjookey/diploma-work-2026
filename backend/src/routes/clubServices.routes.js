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
        body('name').notEmpty().withMessage('Enter service name').trim(),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
        body('subscriptionLessons').isInt({ min: 0 }).withMessage('subscriptionLessons must be a non-negative integer'),
        body('freezedLesson').isInt({ min: 0 }).withMessage('freezedLesson must be a non-negative integer'),
        body('clubId').isInt({ gt: 0 }).withMessage('clubId must be a positive integer'),
        body('type').isIn(['TRIAL', 'SINGLE', 'SUBSCRIPTION', 'CAMP', 'AFTERSCHOOL']).withMessage('Type must be a valid ServiceType'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;

