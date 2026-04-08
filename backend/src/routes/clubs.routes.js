const { Router } = require('express');
const { body } = require('express-validator');
const validator = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/clubs.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post(
    '/',
    authorize('ADMIN'),
    [
        body('name').notEmpty().withMessage('Enter club name').trim(),
        body('description').optional().isString().withMessage('Description must be string').trim(),
        body('classCategoryId').isInt({ gt: 0 }).withMessage('classCategoryId must be a positive integer'),
        body('defaultTeacherId').isInt({ gt: 0 }).withMessage('defaultTeacherId must be a positive integer'),
        body('maxStudents').optional().isInt({ min: 0 }).withMessage('maxStudents must be a non-negative integer'),
    ],
    validator,
    controller.create
);
router.put('/:id', authorize('ADMIN'), controller.update);
router.put('/:id/status', authorize('ADMIN'), controller.updateStatus);
router.delete('/:id', authorize('ADMIN'), controller.remove);

module.exports = router;