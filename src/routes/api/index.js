const express = require('express');
const router = express.Router();

router.get('/fragments', require('./get'));
router.post('/fragments', require('./post'));
router.get('/fragments/:id', require('./get-id'));
router.get('/fragments/:id/info', require('./get-by-id-info'));

module.exports = router;
