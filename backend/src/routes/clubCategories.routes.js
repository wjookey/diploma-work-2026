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
        body('name').notEmpty().withMessage('Enter club category').trim(),
        body('description').optional().isString().withMessage('Description must be string')
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;