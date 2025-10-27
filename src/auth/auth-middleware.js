// src/auth/auth-middleware.js

const { hash } = require('../hash');

/**
 * Middleware to hash the user's email address for privacy
 * This middleware wraps passport authentication and hashes the user email
 * @param {string} strategy - The passport strategy to use ('bearer' or 'http')
 * @returns {Function} - Express middleware function
 */
module.exports = (strategy) => {
  return (req, res, next) => {
    // Import passport and the specific strategy
    const passport = require('passport');

    passport.authenticate(strategy, { session: false }, (err, email) => {
      if (err) {
        return next(err);
      }

      if (!email) {
        return res.status(401).json({
          status: 'error',
          error: {
            message: 'unauthorized',
            code: 401,
          },
        });
      }

      // Hash the email for privacy protection
      req.user = hash(email);
      next();
    })(req, res, next);
  };
};
