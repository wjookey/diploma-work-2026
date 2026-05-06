const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/children.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN', 'PARENT'),
    [
        body('firstName').notEmpty().withMessage('Enter child\'s name'),
        body('lastName').notEmpty().withMessage('Enter child\'s surname'),
    ],
    validate,
    controller.create
);
router.put('/:id', authorize('ADMIN', 'PARENT'), controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;