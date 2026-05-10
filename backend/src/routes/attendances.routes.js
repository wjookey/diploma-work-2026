const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/attendances.controller');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'TEACHER'));

router.get('/', controller.getAll);
router.get('/lesson/:lessonId', controller.getByLesson);
router.post(
    '/',
    [
        body('lessonId').notEmpty().withMessage('Выберите занятие'),
        body('attendances').isArray({ min: 1 }).withMessage('Введите данные посещаемости'),
    ],
    validate,
    controller.markAttendance
);

module.exports = router;
