// src/logger.js

const pino = require('pino');

// Default log level
const level = process.env.LOG_LEVEL || 'info';
const options = { level };

// Enable pretty printing if in debug mode
if (level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// Create the logger instance
const logger = pino(options);

// Print environment variables once in debug mode
if (level === 'debug') {
  logger.debug('--- Environment Variables ---');
  logger.debug(process.env);
  logger.debug('-----------------------------');
}

module.exports = logger;
