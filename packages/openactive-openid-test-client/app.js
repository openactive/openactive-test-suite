/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
const express = require('express');
const http = require('http');
// const { default: axios } = require('axios');
const chalk = require('chalk');
const { Issuer, generators } = require('openid-client');
const config = require('config');
// const { performance } = require('perf_hooks');
// const sleep = require('util').promisify(setTimeout);
const puppeteer = require('puppeteer');

const IDENTITY_SERVER_URL = config.get('identityServerUrl');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// eslint-disable-next-line no-console
const logError = (x) => console.error(chalk.cyanBright(x));
// eslint-disable-next-line no-console
const log = (x) => console.log(chalk.cyan(x));

app.use(express.json());

let client;
let codeVerifier;

(async () => {
  try {
    const issuer = await Issuer.discover(IDENTITY_SERVER_URL);

    console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

    const registration = await issuer.Client.register({
      redirect_uris: ['http://localhost:3000/cb'],
      grant_types: ['authorization_code', 'refresh_token'],
      client_name: 'OpenActive Test Suite Client',
      client_uri: 'https://client.example.org/',
      logo_uri: 'https://client.example.org/newlogo.png',
      scope: 'openid profile openactive-openbooking openactive-ordersfeed oauth-dymamic-client-update openactive-identity',
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    }, {
      initialAccessToken: 'openactive_test_suite_client_12345xaq',
    });

    client = new issuer.Client({
      client_id: registration.client_id,
      client_secret: registration.client_secret,
      redirect_uris: ['http://localhost:3000/cb'],
      response_types: ['code'],
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    });

    codeVerifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.

    const codeChallenge = generators.codeChallenge(codeVerifier);

    const url = client.authorizationUrl({
      scope: 'openid openactive-openbooking oauth-dymamic-client-update offline_access openactive-identity',
      // resource: 'https://my.api.example.com/resource/32178',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    console.log('Test URL: %s', url);

    await authorizeInteractively(url);
  } catch (error) {
    console.error(error);
  }
})();

async function authorizeInteractively(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.type("[name='username' i]", 'test');
  await page.type("[name='password' i]", 'test');
  await page.click('.btn-primary');
  await page.waitForNavigation();
  await page.click('.btn-primary');
  await page.waitForSelector('.openactive-test-callback-success');
  browser.close();
}

app.get('/cb', async function (req, res) {
  res.send('<html><body><h1 class="openactive-test-callback-success">Callback Success</h1></body></html>');
  console.log('Callback received');
  const params = client.callbackParams(req);

  const tokenSet = await client.callback('http://localhost:3000/cb', params, {
    code_verifier: codeVerifier,
  });

  console.log('received and validated tokens %j', tokenSet);
  console.log('validated ID Token claims %j', tokenSet.claims());
  console.log('received refresh token %s', tokenSet.refresh_token);
  const refreshToken = tokenSet.refresh_token;

  const refreshedTokenSet = await client.refresh(refreshToken);
  console.log('refreshed and validated tokens %j', refreshedTokenSet);
  console.log('refreshed ID Token claims %j', refreshedTokenSet.claims());
});

const server = http.createServer(app);
server.on('error', onError);

const port = normalizePort(process.env.PORT || '3000');
app.listen(port, () => log(`Broker Microservice running on port ${port}

Check http://localhost:${port}/status for current harvesting status
`));

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
