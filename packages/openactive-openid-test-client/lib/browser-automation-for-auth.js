const puppeteer = require('puppeteer');
const cookieSession = require('cookie-session');
const { generators } = require('openid-client');

/**
 * Adds routes to Express that facilitate browser automation of the Authorization Code Flow
 */

const AUTHORIZE_SUCCESS_CLASS = 'openactive-test-callback-success';

async function authorizeInteractive({ sessionKey, authorizationUrl, headless, buttonSelector, username, password, context }) {
  const addScreenshot = async (page, title) => {
    const image = await page.screenshot({
      encoding: 'base64',
    });
    const url = page.url();
    context.screenshots.push({
      title,
      url,
      image,
    });
  };
  const browser = await puppeteer.launch({
    headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:3000/auth?key=${encodeURIComponent(sessionKey)}&url=${encodeURIComponent(authorizationUrl)}`);
    await page.type("[name='username' i]", username);
    await page.type("[name='password' i]", password);
    await addScreenshot(page, 'Login page');
    const hasButtonOnLoginPage = await page.$(`${buttonSelector}`);
    if (hasButtonOnLoginPage) {
      await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click(buttonSelector), // Clicking the link will indirectly cause a navigation
      ]);
    } else {
      throw new Error(`Login button matching selector '${buttonSelector}' not found`);
    }
    const isSuccessfulFollowingLogin = await page.$(`.${AUTHORIZE_SUCCESS_CLASS}`);
    if (isSuccessfulFollowingLogin) {
      context.requiredConsent = false;
    } else {
      await addScreenshot(page, 'Authorization page');
      const hasButtonOnAuthorizationPage = await page.$(`${buttonSelector}`);
      if (hasButtonOnAuthorizationPage) {
        context.requiredConsent = true;
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
    await addScreenshot(page, 'Error encountered');
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

  app.post('/browser-automation-for-auth', async function (req, res, next) {
    try {
      const sessionKey = sessionKeyCounter;
      sessionKeyCounter += 1;
      const context = {
        res,
        screenshots: [],
      };
      requestStore.set(String(sessionKey), context);
      if (!req.body) {
        throw new Error('The middleware express.json() must be set up before a call to setupBrowserAutomationRoutes(app) is made.');
      }
      try {
        await authorizeInteractive({
          sessionKey,
          context,
          ...req.body,
        });
      } catch (err) {
        context.error = err.message;
        res.status(400).json({
          error: err.message,
          screenshots: context.screenshots,
          requiredConsent: context.requiredConsent,
        });
        requestStore.delete(sessionKey);
      }
    } catch (err) {
      next(err);
    }
  });

  app.get('/auth', async function (req, res, next) {
    try {
      const { url, key } = req.query;
      // Set the key in the session and redirect
      req.session.key = key;
      if (url && url !== 'undefined') {
        res.redirect(301, url);
      } else {
        res.status(400).json('No url was provided');
      }
    } catch (err) {
      next(err);
    }
  });

  app.get('/cb', async function (req, res, next) {
    try {
      const sessionKey = req.session.key;
      res.send('<html><body><h1 class="openactive-test-callback-success">Callback Success</h1></body></html>');
      if (!requestStore.has(sessionKey)) {
        throw new Error(`Session key '${sessionKey}' not found`);
      }
      const context = requestStore.get(sessionKey);
      context.res.json({
        screenshots: context.screenshots,
        callbackUrl: req.originalUrl,
        requiredConsent: context.requiredConsent,
      });
      requestStore.delete(sessionKey);
    } catch (err) {
      next(err);
    }
  });
}

module.exports = {
  setupBrowserAutomationRoutes,
};
