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
    },
  });

router.get('/fragments', authenticate('bearer'), require('./get'));
router.post('/fragments', authenticate('bearer'), rawBody(), require('./post'));
router.get('/fragments/:id', authenticate('bearer'), require('./get-id'));
router.get('/fragments/:id/info', authenticate('bearer'), require('./get-by-id-info'));
router.delete('/fragments/:id', authenticate('bearer'), require('./delete-by-id'));
router.patch('/fragments/:id', authenticate('bearer'), require('./patch'));

module.exports = router;
