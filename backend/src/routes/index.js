const express = require('express');
const router = express.Router();

router.use('/test', require('./test.routes'));

module.exports = router;