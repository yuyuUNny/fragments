// src/server.js
require('dotenv').config();
const stoppable = require('stoppable');
const logger = require('./logger');
const app = require('./app');

// Get port from environment or default to 8080
const port = parseInt(process.env.PORT || '8080', 10);

// Start a server
const server = stoppable(
  app.listen(port, () => {
    logger.info(`Server started on port ${port}`);
  })
);

// Export our server instance
module.exports = server;
