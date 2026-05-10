const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post(
    '/requestCode',
    [
        body('email').isEmail().withMessage('Введите корректную почту'),
        body('phone').optional({ checkFalsy: true }).isMobilePhone('ru-RU').withMessage('Введите корректный номер телефона'),
    ],
    validate,
    controller.requestCode
);
router.post(
    '/verifyCode',
    [
        body('email').isEmail().withMessage('Введите корректную почту'),
        body('code').isLength({ min: 6 }).withMessage('Код должен включать 6 символов'),
    ],
    validate,
    controller.verifyCode
)
router.get('/me', authenticate, controller.getMe);
router.post('/refresh', controller.refreshToken);
router.post('/logout', authenticate, controller.logout);

module.exports = router;