const puppeteer = require('puppeteer');
const cookieSession = require('cookie-session');
const { generators } = require('openid-client');

const AUTHORIZE_SUCCESS_CLASS = 'openactive-test-callback-success';

async function authorizeInteractive(sessionKey, url, headless, buttonSelector, username, password, context) {
  const browser = await puppeteer.launch({
    headless,
  });
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:3000/auth?key=${encodeURIComponent(sessionKey)}&url=${encodeURIComponent(url)}`);
    await page.type("[name='username' i]", username);
    await page.type("[name='password' i]", password);
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
    context.screenshots.error = await page.screenshot({
      encoding: 'base64',
    });
    context.screenshots.error = context.screenshots.error.substr(0, 10); // TODO: Remove substr; truncated to ease debugging
    browser.close();
  }
}

let sessionKeyCounter = 0;
const requestStore = new Map();

function setupBrowserAutomationRoutes(app) {
  app.use(cookieSession({
    name: 'session',
    keys: [generators.codeVerifier()], // Random string as key

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }));

  app.post('/browser-automation-for-auth', async function (req, res) {
    const sessionKey = sessionKeyCounter;
    sessionKeyCounter += 1;
    const context = {
      res,
      screenshots: {
      },
    };
    requestStore.set(String(sessionKey), context);
    const { authorizationUrl, headless, buttonSelector, username, password } = req.body;
    try {
      await authorizeInteractive(sessionKey, authorizationUrl, headless, buttonSelector, username, password, context);
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
  });

  app.get('/cb', async function (req, res) {
    const sessionKey = req.session.key;
    res.send('<html><body><h1 class="openactive-test-callback-success">Callback Success</h1></body></html>');
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
}

module.exports = {
  setupBrowserAutomationRoutes,
};
