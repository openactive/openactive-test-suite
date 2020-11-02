/* eslint-disable no-use-before-define */
const express = require('express');
const { default: axios } = require('axios');
const chalk = require('chalk');
const { Issuer } = require('openid-client');
const config = require('config');
const { performance } = require('perf_hooks');
const sleep = require('util').promisify(setTimeout);

const IDENTITY_SERVER_URL = config.get('identityServerUrl');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// eslint-disable-next-line no-console
const logError = (x) => console.error(chalk.cyanBright(x));
// eslint-disable-next-line no-console
const log = (x) => console.log(chalk.cyan(x));

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger('dev'));
}
app.use(express.json());



const { Issuer } = require('openid-client');
Issuer.discover(IDENTITY_SERVER_URL) // => Promise
  .then(function (googleIssuer) {
    console.log('Discovered issuer %s %O', googleIssuer.issuer, googleIssuer.metadata);

    const client = new googleIssuer.Client({
      client_id: 'zELcpfANLqY7Oqas',
      client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
      redirect_uris: ['http://localhost:3000/cb'],
      response_types: ['code'],
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    });


  });

  const { generators } = require('openid-client');

  app.get('/cb', function (req, res) {
    const code_verifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.
     
    const code_challenge = generators.codeChallenge(code_verifier);
     
    client.authorizationUrl({
      scope: 'openid email profile',
      resource: 'https://my.api.example.com/resource/32178',
      code_challenge,
      code_challenge_method: 'S256',
    });

      res.send('yay');
  });








const server = http.createServer(app);
server.on('error', onError);

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => log(`Broker Microservice running on port ${port}

Check http://localhost:${port}/status for current harvesting status
`));

(async () => {
  try {
    await startPolling();
  } catch (error) {
    logError(error.toString());
    process.exit(1);
  }
})();

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
      logError(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logError(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
