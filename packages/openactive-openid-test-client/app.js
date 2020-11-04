/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
const express = require('express');
const http = require('http');
const chalk = require('chalk');
const { generators } = require('openid-client');

// const { performance } = require('perf_hooks');
// const sleep = require('util').promisify(setTimeout);
const puppeteer = require('puppeteer');
const cookieSession = require('cookie-session');

const { oauthAuthenticate } = require('./lib.js');

// const { RequestInterceptor } = require('./node_modules/node-request-interceptor/lib/index.js');
// const withDefaultInterceptors = require('./node_modules/node-request-interceptor/lib/presets/default.js');

/*
// @ts-ignore
const interceptor = new RequestInterceptor(withDefaultInterceptors);

interceptor.use((req) => {
  // Will print to stdout any outgoing requests
  // without affecting their responses
  console.log('%s %s', req.method, req.url.href);
});
*/

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

// eslint-disable-next-line no-console
const logError = (x) => console.error(chalk.cyanBright(x));
// eslint-disable-next-line no-console
const log = (x) => console.log(chalk.cyan(x));

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: [generators.codeVerifier()], // Random string as key

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));

(async () => {
  try {
    oauthAuthenticate();
  } catch (error) {
    console.error(error);
  }
})();

const AUTHORIZE_SUCCESS_CLASS = 'openactive-test-callback-success';
async function authorizeInteractive(sessionKey, url, headless, buttonSelector, context) {
  const browser = await puppeteer.launch({
    headless,
  });
  try {
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/auth?key=${encodeURIComponent(sessionKey)}&url=${encodeURIComponent(url)}`);
    await page.type("[name='username' i]", 'test');
    await page.type("[name='password' i]", 'test');
    context.screenshots.login = await page.screenshot({
      encoding: 'base64',
    });
    context.screenshots.login = context.screenshots.login.substr(0, 10); // TODO: Remove substr; truncated to ease debugging
    const hasButtonOnLoginPage = await page.$(`${buttonSelector}`);
    if (hasButtonOnLoginPage) {
      await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click(buttonSelector), // Clicking the link will indirectly cause a navigation
      ]);
    } else {
      throw new Error(`Login button matching selector '${buttonSelector}' not found`);
    }
    context.screenshots.accept = await page.screenshot({
      encoding: 'base64',
    });
    context.screenshots.accept = context.screenshots.accept.substr(0, 10); // TODO: Remove substr; truncated to ease debugging
    const isSuccessfulFollowingLogin = await page.$(`.${AUTHORIZE_SUCCESS_CLASS}`);
    if (!isSuccessfulFollowingLogin) {
      const hasButtonOnAuthorizationPage = await page.$(`${buttonSelector}`);
      if (hasButtonOnAuthorizationPage) {
        context.requiredAuthorisation = true;
        // Click "Accept", if it is presented
        await Promise.all([
          page.waitForNavigation(), // The promise resolves after navigation has finished
          page.click(buttonSelector), // Clicking the link will indirectly cause a navigation
        ]);
      } else {
        throw new Error(`Accept button matching selector '${buttonSelector}' not found`);
      }
    }
    const isSuccessfulFollowingAuthorization = await page.$(`.${AUTHORIZE_SUCCESS_CLASS}`);
    if (!isSuccessfulFollowingAuthorization) {
      throw new Error('Callback page redirect was not detected.');
    }
  } finally {
    browser.close();
  }
}

let sessionKeyCounter = 0;
const requestStore = new Map();
app.post('/auth-interactive', async function (req, res) {
  const sessionKey = sessionKeyCounter;
  sessionKeyCounter += 1;
  const context = {
    res,
    screenshots: {
    },
  };
  requestStore.set(String(sessionKey), context);
  const { authorizationUrl, headless, buttonSelector } = req.body;
  try {
    await authorizeInteractive(sessionKey, authorizationUrl, headless, buttonSelector, context);
  } catch (err) {
    context.error = err.message;
    res.status(400).json({
      error: err.message,
      screenshots: context.screenshots,
      requiredAuthorisation: context.requiredAuthorisation,
    });
    requestStore.delete(sessionKey);
  }
});

app.get('/auth', async function (req, res) {
  const { url, key } = req.query;
  // Set the key in the session and redirect
  req.session.key = key;
  res.redirect(301, url);
  console.log('First page');
});

app.get('/cb', async function (req, res) {
  const sessionKey = req.session.key;
  res.send('<html><body><h1 class="openactive-test-callback-success">Callback Success</h1></body></html>');
  console.log('Callback received');
  if (!requestStore.has(sessionKey)) {
    throw new Error(`Session key '${sessionKey}' not found`);
  }
  const context = requestStore.get(sessionKey);
  context.res.json({
    screenshots: context.screenshots,
    callbackUrl: req.originalUrl,
    requiredAuthorisation: context.requiredAuthorisation,
  });
  requestStore.delete(sessionKey);
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
