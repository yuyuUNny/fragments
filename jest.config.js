// jest.config.js
const path = require('path');
const envFile = path.join(__dirname, '.env');

// Read the environment variables
require('dotenv').config({ path: envFile });

// Log a message to remind developers how to see more detail from log messages
console.log(`Using LOG_LEVEL=${process.env.LOG_LEVEL}. Use 'debug' in env.jest for more detail`);

// Set our Jest options, see http://localhost:8080
module.exports = {
  verbose: true,
  testTimeout: 5000,
};
