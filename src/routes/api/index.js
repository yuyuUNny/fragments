// src/routes/api/index.js
const express = require('express');
const router = express.Router();
const authenticate = require('../../auth/auth-middleware');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    }
  });

router.get('/fragments', authenticate('http'), require('./get'));
router.post('/fragments', authenticate('http'), rawBody(), require('./post'));
router.get('/fragments/:id', authenticate('http'), require('./get-id'));
router.get('/fragments/:id/info', authenticate('http'), require('./get-by-id-info'));

module.exports = router;
