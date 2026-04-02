const { Router } = require('express');

const router = Router();

router.use('/test', require('./test.routes'));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/children', require('./children.routes'));
router.use('/families', require('./families.routes'));

module.exports = router;