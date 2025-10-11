// src/hash.js

const crypto = require('crypto');

const algorithm = 'sha256';
const secret = process.env.HASH_SECRET || 'default-secret';

function hash (email) {
  if (email === null || email === undefined || typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  if (email.length === 0) {
    return crypto.createHmac(algorithm, secret).update('').digest('hex');
  }

  return crypto.createHmac(algorithm, secret).update(email).digest('hex');
}

module.exports = { hash };
