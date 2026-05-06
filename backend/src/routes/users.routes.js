const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/users.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN', 'PARENT'),
    [
        body('email').isEmail().withMessage('Enter correct email'),
        body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 symbols'),
        body('firstName').notEmpty().withMessage('Enter first name'),
        body('lastName').notEmpty().withMessage('Enter last name'),
        body('phone').isMobilePhone('ru-RU').withMessage('Enter phone number'),
        body('role').isIn(['ADMIN', 'TEACHER', 'PARENT']).withMessage('Incorrect role'),
        body('familyId').optional().notEmpty().withMessage('Enter family'),
    ],
    validate,
    controller.create
);
router.put(
    '/:id',
    authorize('ADMIN', 'PARENT'),
    [
        body('phone').optional().isMobilePhone('ru-RU').withMessage('Enter correct phone number'),
        body('email').optional().isEmail().withMessage('Enter correct email'),
    ],
    validate,
    controller.update
);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;