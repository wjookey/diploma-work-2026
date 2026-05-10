const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/clubCategories.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('name').notEmpty().withMessage('Введите название категории занятий').trim(),
        body('description').optional().isString().withMessage('Описание должно быть строкой')
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;