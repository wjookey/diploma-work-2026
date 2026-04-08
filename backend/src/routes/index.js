const { Router } = require('express');

const router = Router();

router.use('/test', require('./test.routes'));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/children', require('./children.routes'));
router.use('/families', require('./families.routes'));
router.use('clubCategories', require('./clubCategories.routes'));
router.use('/clubs', require('./clubs.routes'));
router.use('/clubServices', require('./clubServices.routes'));
router.use('/lessons', require('./lessons.routes'));
router.use('/attendances', require('./attendances.routes'));
router.use('/subscriptions', require('./subscriptions.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/subscriptionRequests', require('./subscriptionRequests.routes'));

module.exports = router;