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
        body('familyName').notEmpty().withMessage('Введите название для семьи').trim(),
        body('parents').isArray({ min: 1 }).withMessage('Добавьте хотя бы одного родителя'),
        body('parents.*.user.email').isEmail().withMessage('Введите корректную почту родителя'),
        body('parents.*.user.firstName').notEmpty().withMessage('Введите имя родителя'),
        body('parents.*.user.lastName').notEmpty().withMessage('Введите фамилию родителя'),
        body('parents.*.user.phone').isMobilePhone('ru-RU').withMessage('Введите корректный номер телефона родителя'),
        body('children').isArray({ min: 1 }).withMessage('Добавьте хотя бы одного ребёнка'),
        body('children.*.firstName').notEmpty().withMessage('Введите имя ребёнка'),
        body('children.*.lastName').notEmpty().withMessage('Введите фамилию ребёнка'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;