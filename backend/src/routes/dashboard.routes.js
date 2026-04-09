const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/dashboard.controller');

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/stats', controller.getStats);
router.get('/recent', controller.getRecentActivity);

module.exports = router;