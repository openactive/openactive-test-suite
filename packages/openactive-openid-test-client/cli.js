/* eslint-disable no-console */
const yargs = require('yargs');
const express = require('express');
const http = require('http');
const { OpenActiveOpenIdTestClient, logWithIntercept, setupBrowserAutomationRoutes } = require('.');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

app.listen(port, () => console.log(`Browser automation service running on port ${port}`));

/**
 * CLI runner
 */

const BASE_URL = `http://localhost:${port}`;

// Create new client
const client = new OpenActiveOpenIdTestClient(BASE_URL);

const cli = yargs
  .command('$0 [url]', 'OpenActive OpenID Connect Test Client CLI', (yargsConfig) => {
    yargsConfig
      .positional('url', {
        describe: 'Identity Server Base URI',
        default: 'https://localhost:44353',
      })
      .option('initialAccessToken', {
        alias: 't',
        description: 'Initial Access Token for Dynamic Client Registration',
        default: 'openactive_test_suite_client_12345xaq',
      })
      .option('username', {
        alias: 'u',
        description: 'Username of the Seller',
        default: 'test',
      })
      .option('password', {
        alias: 'p',
        description: 'Password of the Seller',
        default: 'test',
      });
  }, async (argv) => {
    try {
      // Discovery
      const issuer = await logWithIntercept('Discovery', () => client.discover(argv.url));
      console.log('Discovered issuer %s %O\n\n', issuer.issuer, issuer.metadata);

      // Dynamic Client Registration
      const { registration, clientId, clientSecret } = await logWithIntercept('Dynamic Client Registration', () => client.register(argv.initialAccessToken));
      console.log('Dynamic Client Registration: %O\n\n', registration);

      // Client Credentials Flow
      const { tokenSet: clientCredentialsTokenSet } = await logWithIntercept('Client Credentials Flow', () => client.authorizeClientCredentialsFlow(clientId, clientSecret));
      console.log('Client Credentials Flow: received and validated tokens %j\n\n', clientCredentialsTokenSet);

      // Authorization Code Flow
      const { tokenSet } = await logWithIntercept('Authorization Code Flow', () => client.authorizeAuthorizationCodeFlow(clientId, clientSecret, {
        buttonSelector: '.btn-primary',
        headless: true,
        username: argv.username,
        password: argv.password,
      }));
      const refreshToken = tokenSet.refresh_token;
      console.log('Authorization Code Flow: received and validated tokens %j', tokenSet);
      console.log('Authorization Code Flow: validated ID Token claims %j', tokenSet.claims());
      console.log('Authorization Code Flow: received refresh token %s\n\n', tokenSet.refresh_token);

      // Refresh Token
      const refreshedTokenSet = await logWithIntercept('Refresh Token', () => client.refresh(refreshToken, clientId, clientSecret));
      console.log('refreshed and validated tokens %j', refreshedTokenSet);
      console.log('refreshed ID Token claims %j\n\n', refreshedTokenSet.claims());

      // Exit
      process.exit(0);
    } catch (error) {
      console.log(error);
    }
  });

// Execute yargs
// eslint-disable-next-line no-unused-expressions
cli.argv;
