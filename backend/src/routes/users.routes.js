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
        body('email').isEmail().withMessage('Введите корректную почту'),
        body('firstName').notEmpty().withMessage('Введите имя'),
        body('lastName').notEmpty().withMessage('Введите фамилию'),
        body('phone').isMobilePhone('ru-RU').withMessage('Введите корректный номер телефона'),
        body('role').isIn(['ADMIN', 'TEACHER', 'PARENT']).withMessage('Неизвестная роль'),
        body('familyId').optional().notEmpty().withMessage('Выберите семью'),
    ],
    validate,
    controller.create
);
router.put(
    '/:id',
    [
        body('phone').optional().isMobilePhone('ru-RU').withMessage('Введите корректный номер телефона'),
        body('email').optional().isEmail().withMessage('Введите корректную почту'),
    ],
    validate,
    controller.update
);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;