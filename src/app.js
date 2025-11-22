// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pino = require('pino-http');

// Custom modules
const logger = require('./logger');

// author and version from our package.json file
const { author, version } = require('../package.json');

// Create an express app
const app = express();

// Security, CORS, Compression
app.use(helmet());
app.use(compression());
app.use(cors());

// Logging with Pino
app.use(pino({ logger }));

// Set up our passport authentication middleware
const passport = require('passport');
const authenticate = require('./auth');

// Only set up passport strategy if it exists (not null for testing)
if (authenticate.strategy && authenticate.strategy()) {
  passport.use(authenticate.strategy());
}
app.use(passport.initialize());
// Initialize passport authentication

// Main routes
app.use('/v1', require('./routes'));

// Health check route
app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/yuyuUNny/fragments',
    version
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404
    }
  });
});

// Error handler
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  if (process.env.NODE_ENV !== 'test') {
    logger.error(err);
  }

  res.status(status).json({
    status: 'error',
    error: {
      message,
      code: status
    }
  });
});

// Export app
module.exports = app;
