const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Enter correct email'),
        body('password').notEmpty().withMessage('Enter the password'),
    ],
    validate,
    controller.login
);
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Enter correct email'),
        body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 symbols'),
        body('firstName').notEmpty().withMessage('Enter first name'),
        body('lastName').notEmpty().withMessage('Enter last name'),
        body('phone').isMobilePhone('ru-RU').withMessage('Enter phone number'),
    ],
    validate,
    controller.register
)
router.get('/me', authenticate, controller.getMe);
router.put(
    '/password',
    authenticate,
    [
        body('currentPassword').notEmpty().withMessage('Enter current password'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password should be at least 6 symbols'),
    ],
    validate,
    controller.changePassword
);
router.post('/refresh', controller.refreshToken);
router.post('/logout', authenticate, controller.logout);

module.exports = router;