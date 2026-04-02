const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/families.controller');

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('familyName').notEmpty().withMessage('Enter family name').trim(),
        body('parents').isArray({ min: 1 }).withMessage('At least one parent is required'),
        body('parents.*.user.email').isEmail().withMessage('Enter correct email for parent'),
        body('parents.*.user.password').isLength({ min: 6 }).withMessage('Password should be at least 6 symbols'),
        body('parents.*.user.firstName').notEmpty().withMessage('Enter first name for parent'),
        body('parents.*.user.lastName').notEmpty().withMessage('Enter last name for parent'),
        body('parents.*.user.phone').isMobilePhone('ru-RU').withMessage('Enter phone number for parent'),
        body('children').isArray({ min: 1 }).withMessage('At least one child is required'),
        body('children.*.firstName').notEmpty().withMessage('Enter first name for child'),
        body('children.*.lastName').notEmpty().withMessage('Enter last name for child'),
        body('children.*.birthDate').optional().isISO8601().withMessage('Enter correct birth date (YYYY-MM-DD)'),
        body('children.*.note').optional().isString().withMessage('Note must be a string'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;