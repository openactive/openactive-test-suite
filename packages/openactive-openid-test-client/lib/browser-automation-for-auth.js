const cookieSession = require('cookie-session');
const { generators } = require('openid-client');
const puppeteer = require('puppeteer');

/**
 * @typedef {{
 *   send: (status: number, json: any) => void,
 *   screenshots: { title: string, url: string, image: string }[],
 *   requiredConsent?: boolean,
 * }} Context
 */

/**
 * @typedef {{
 *  username: string,
 *  password: string,
 *  button: string
 * }} ButtonSelectors
 */

/**
 * Adds routes to Express that facilitate browser automation of the Authorization Code Flow
 */

const AUTHORIZE_SUCCESS_CLASS = 'openactive-test-callback-success';

/**
 * @param {import('puppeteer').Page} page
 * @param {string} title
 * @param {Context} context
 */
async function addScreenshot(page, title, context) {
  const imageBuffer = await page.screenshot({
    encoding: 'base64',
  });
  const image = imageBuffer.toString();
  const url = page.url();
  context.screenshots.push({
    title,
    url,
    image,
  });
}

/**
 * @param {object} args
 * @param {string} args.sessionKey
 * @param {string} args.authorizationUrl
 * @param {boolean} [args.headless]
 * @param {ButtonSelectors} args.buttonSelectors
 * @param {string} args.username
 * @param {string} args.password
 * @param {Context} args.context
 */
async function authorizeInteractive({ sessionKey, authorizationUrl, headless, buttonSelectors, username, password, context }) {
  // Get CHROMIUM_FLAGS from environment variable
  const chromiumFlags = process.env.CHROMIUM_FLAGS ? process.env.CHROMIUM_FLAGS.split(' ') : [];
  const browser = await puppeteer.launch({
    headless: headless ? 'new' : false, // Note this uses the "new" improved Chrome headless mode (https://developer.chrome.com/articles/new-headless/), which will become the default in future
    ignoreHTTPSErrors: true,
    args: chromiumFlags.concat(['--disable-gpu', '--single-process', '--disable-extensions']),
  });
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:3000/auth?key=${encodeURIComponent(sessionKey)}&url=${encodeURIComponent(authorizationUrl)}`);
    try {
      await page.type(buttonSelectors.username, username);
    } catch (e) {
      await addScreenshot(page, 'Error encountered trying to enter username', context);
      return {
        success: false, message: `Error encountered trying to enter username. ${e.message}`,
      };
    }
    try {
      await page.type(buttonSelectors.password, password);
    } catch (e) {
      await addScreenshot(page, 'Error encountered trying to enter password', context);
      return {
        success: false, message: `Error encountered trying to enter password. ${e.message}`,
      };
    }
    await addScreenshot(page, 'Login page', context);
    const hasButtonOnLoginPage = await page.$(buttonSelectors.button);
    if (hasButtonOnLoginPage) {
      // As far as we can tell, consent does not seem to be required yet.
      context.requiredConsent = false;
      await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click(buttonSelectors.button), // Clicking the link will indirectly cause a navigation
      ]);
    } else {
      await addScreenshot(page, 'Error encountered', context);
      return {
        success: false, message: `Login button matching selector '${buttonSelectors.button}' not found`,
      };
    }
    const isSuccessfulFollowingLogin = await page.$(`.${AUTHORIZE_SUCCESS_CLASS}`);
    if (!isSuccessfulFollowingLogin) {
      // If we do not see the callback page, then it is likely we're being asked for consent to authorize access
      await addScreenshot(page, 'Authorization page', context);
      const hasButtonOnAuthorizationPage = await page.$(buttonSelectors.button);
      if (hasButtonOnAuthorizationPage) {
        context.requiredConsent = true;
        // Click "Accept", if it is presented
        await Promise.all([
          page.waitForNavigation(), // The promise resolves after navigation has finished
          page.click(buttonSelectors.button), // Clicking the link will indirectly cause a navigation
        ]);
      } else {
        await addScreenshot(page, 'Error encountered', context);
        return {
          success: false, message: `Accept button matching selector '${buttonSelectors.button}' not found`,
        };
      }
    }
    const isSuccessfulFollowingAuthorization = await page.$(`.${AUTHORIZE_SUCCESS_CLASS}`);
    if (!isSuccessfulFollowingAuthorization) {
      await addScreenshot(page, 'Error encountered', context);
      return {
        success: false, message: 'Callback page redirect was not detected.',
      };
    }
    return {
      success: true,
    };
  } catch (e) {
    try {
      await addScreenshot(page, 'Error encountered', context);
    } catch {
      // Ignore
    }
    return {
      success: false, message: `Unexpected browser automation error encountered: ${e.stack}`,
    };
  } finally {
    await browser.close();
  }
}

let sessionKeyCounter = 0;
/** @type {Map<string, Context>} */
const requestStore = new Map();

/**
 * @param {import('express').Application} app
 * @param {ButtonSelectors} buttonSelectors
 */
function setupBrowserAutomationRoutes(app, buttonSelectors) {
  app.use(cookieSession({
    name: 'session',
    keys: [generators.codeVerifier()], // Random string as key

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }));

  app.post('/browser-automation-for-auth', async (req, res, next) => {
    try {
      const sessionKey = sessionKeyCounter;
      sessionKeyCounter += 1;
      // Context maintained throughout authorisation code flow lifecycle
      const context = {
        send(status, json) {
          // Don't allow send to be called twice
          context.send = (status_, json_) => {
            console.error(`Error: Browser automation service swallowed response with status '${status_}' and content '${JSON.stringify(json_, null, 2)}'`);
          };
          res.status(status).json(json);
        },
        screenshots: [],
      };
      requestStore.set(String(sessionKey), context);
      if (!req.body) {
        throw new Error('The middleware express.json() must be set up before a call to setupBrowserAutomationRoutes(app) is made.');
      }

      // TODO verify that req.body has the correct (and correctly typed properties)
      const result = await authorizeInteractive({
        sessionKey,
        context,
        buttonSelectors,
        ...req.body,
      });
      if (!result.success) {
        context.error = result.message;
        context.send(400, {
          error: result.message,
          screenshots: context.screenshots,
          requiredConsent: context.requiredConsent,
        });
        requestStore.delete(String(sessionKey));
      }
    } catch (err) {
      next(err);
    }
  });

  // Private endpoint, only called by authorizeInteractive function
  app.get('/auth', (req, res, next) => {
    try {
      const { url, key } = req.query;
      if (typeof url !== 'string') {
        res.status(400).json({
          error: `url query param should be a string. Value: ${url}`,
        });
        return;
      }
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

  // Private endpoint, only called by authorizeInteractive function
  app.get('/cb', async (req, res, next) => {
    try {
      const sessionKey = req.session.key;
      res.send('<html><body><h1 class="openactive-test-callback-success">Callback Success</h1></body></html>');
      if (!requestStore.has(sessionKey)) {
        throw new Error(`Session key '${sessionKey}' not found`);
      }
      const context = requestStore.get(sessionKey);
      context.send(200, {
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
