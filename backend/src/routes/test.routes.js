const express = require('express');

const router = express.Router();

router.get('/get', (req, res) => {
    res.json({ message: "Hello I'm a GET request from testRoutes!" });
});
router.post('/post', (req, res) => {
    res.json({ message: "Hello I'm a POST request from testRoutes!" });
});
router.put('/put', (req, res) => {
    res.json({ message: "Hello I'm a PUT request from testRoutes!" });
});
router.delete('/delete', (req, res) => {
    res.json({ message: "Hello I'm a DELETE request from testRoutes!" });
});

module.exports = router;