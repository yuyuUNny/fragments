const express = require('express');
const router = express.Router();

router.get('/fragments', require('./get'));
router.post('/fragments', require('./post'));

module.exports = router;
