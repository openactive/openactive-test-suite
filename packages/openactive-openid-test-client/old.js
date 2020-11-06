/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
const express = require('express');
const http = require('http');
const chalk = require('chalk');

// const { performance } = require('perf_hooks');
// const sleep = require('util').promisify(setTimeout);

const config = require('config');

const OpenActiveTestAuthKeyManager = require('./lib/auth-key-manager');
const { setupBrowserAutomationRoutes } = require('./lib/browser-automation-for-auth');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const IDENTITY_SERVER_URL = config.get('identityServerUrl');

// eslint-disable-next-line no-console
const log = (x) => console.log(chalk.cyan(x));

/**
 * Set up brower automation service
 */

const app = express();
app.use(express.json());
setupBrowserAutomationRoutes(app);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const integerPort = parseInt(val, 10);

  if (Number.isNaN(integerPort)) {
    // named pipe
    return val;
  }

  if (integerPort >= 0) {
    // port number
    return integerPort;
  }

  return false;
}

const port = normalizePort(process.env.PORT || '3000');

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Local server
 */

const server = http.createServer(app);
server.on('error', onError);

app.listen(port, () => console.log(`Browser Automation service running on port ${port}`));

const authKeyManager = new OpenActiveTestAuthKeyManager(log, 'http://localhost:3000', config.get('sellers'), config.get('bookingPartners'));

app.get('/config', async function (req, res) {
  await authKeyManager.updateAccessTokens();
  res.json(authKeyManager.config);
});

(async () => {
  try {
    await authKeyManager.initialise(IDENTITY_SERVER_URL);
  } catch (error) {
    console.error(error);
  }
})();
