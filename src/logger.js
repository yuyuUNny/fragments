// src/logger.js

const pino = require('pino');

// Use `info` as our standard log level if not specified
const options = { level: process.env.LOG_LEVEL || 'info' };

// If we're doing `debug` logging, make the logs easier to read
if (options.level === 'debug') {
  // https://github.com/pinojs/pino-pretty
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// // Create and export a Pino Logger instance:
// // https://getpino.io/#/docs/api?id=logger
// module.exports = require('pino')(options);

// Create the logger instance
const logger = pino(options);

// If debug mode, print all environment variables once
if (process.env.LOG_LEVEL === 'debug') {
  logger.debug('--- Environment Variables ---');
  logger.debug(process.env);
  logger.debug('-----------------------------');
}

module.exports = logger;
