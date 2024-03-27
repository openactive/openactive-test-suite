const cookieSession = require('cookie-session');
const { generators } = require('openid-client');
const puppeteer = require('puppeteer');

/**
 * @typedef {{
 *   send: (status: number, json: any) => void,
 *   screenshots: { title: string, url: string, image: string }[],
 *   requiredConsent?: boolean,
 * }} AuthSessionContext
 */

/**
 * @typedef {{
 *  username: string,
 *  password: string,
 *  button: string
 * }} ButtonSelectors
 */

/**
 * @typedef {object} BrowserAutomationForAuthOptions
 * @property {string} authorizationUrl The URL to the OpenID Provider's
 *   authorization (login) page.
 *   This MUST include the necessary query params including the redirect_uri
 *   set to the `/cb` endpoint.
 * @property {boolean} [headless]
 * @property {string} username
 * @property {string} password
 */

/**
 * Adds routes to Express that facilitate browser automation of the Authorization Code Flow
 */

const AUTHORIZE_SUCCESS_CLASS = 'openactive-test-callback-success';

/**
 * @param {import('puppeteer').Page} page
 * @param {string} title
 * @param {AuthSessionContext} context
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
 * Launch a headless browser (using puppeteer), go to the OpenID Provider's
 * login page and login using the provided username and password.
 *
 * Screenshots of the process (including any errors encountered) are saved to
 * the AuthSessionContext, which can be used to debug any issues.
 *
 * @param {BrowserAutomationForAuthOptions & {
 *   sessionKey: string,
 *   buttonSelectors: ButtonSelectors,
 *   context: AuthSessionContext,
 * }} args
 */
async function authorizeInteractive({ sessionKey, authorizationUrl, headless, buttonSelectors, username, password, context }) {
  // Get CHROMIUM_FLAGS from environment variable
  const chromiumFlags = process.env.CHROMIUM_FLAGS ? process.env.CHROMIUM_FLAGS.split(' ') : [];
  const browser = await puppeteer.launch({
    // eslint-disable-next-line no-unneeded-ternary
    headless: headless ? true : false,
    /* TODO: Once Chrome's "new" headless mode
    (https://developer.chrome.com/articles/new-headless/) is more stable (or
    puppeteer's integration with it is more stable), we should change the
    default headless setting to `'new'` rather than `true`. This mode will
    become the default in the future (as of Autumn 2023, this "new" mode causes
    1 in 20 runs to fail randomly) */
    ignoreHTTPSErrors: true,
    args: chromiumFlags.concat(['--disable-gpu', '--single-process', '--disable-extensions']),
  });
  const page = await browser.newPage();
  try {
    /* Associate this browser session with its AuthSessionContext, which will
    later be used by /cb to send a response back to the client.
    And then, load the OpenID Provider's login page */
    await page.goto(`http://localhost:3000/auth?key=${encodeURIComponent(sessionKey)}&url=${encodeURIComponent(authorizationUrl)}`);
    try {
      // Wait for the login button to appear (useful for Next.js / React apps)
      await page.waitForFunction(
        // eslint-disable-next-line no-undef
        (selector) => !!document.querySelector(selector),
        {
          timeout: 10000,
        },
        buttonSelectors.button,
      );
    } catch (e) {
      await addScreenshot(page, 'Error encountered', context);
      return {
        success: false, message: `Login button matching selector '${buttonSelectors.button}' did not appear within 10 seconds`,
      };
    }
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
    /* By this point, if successful, the /cb endpoint should have been called
    by the Auth Code initiated by pressing the button */
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
/** @type {Map<string, AuthSessionContext>} */
const requestStore = new Map();

/**
 * @param {import('express').Application} expressApp
 * @param {ButtonSelectors} buttonSelectors
 */
function setupBrowserAutomationRoutes(expressApp, buttonSelectors) {
  expressApp.use(cookieSession({
    name: 'session',
    keys: [generators.codeVerifier()], // Random string as key

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }));

  /**
   * Perform a complete Auth Code Flow process against the OpenID Provider
   * using a headless browser.
   *
   * This endpoint is the interface for the browser auth automation service.
   *
   * It's an endpoint rather than a function just for convenience of use rather
   * than having to pass the function around.
   *
   * Expected req.body (JSON) is a BrowserAutomationForAuthOptions object.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  const browserAutomationForAuthRoute = async (req, res, next) => {
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

      /* TODO validate req.body and then type the response to ensure that it has
      the correct fields for this function call. Validation and typing can
      simultaneously be achieved with zod. */
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
  };

  /**
   * Private endpoint, only called by authorizeInteractive function.
   *
   * Associates this session with a AuthSessionContext (keyed with req.query.key)
   * and redirects to the URL provided in req.query.url.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  const authRoute = (req, res, next) => {
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
  };

  /**
   * Private endpoint, only called by authorizeInteractive function
   *
   * The callback endpoint for the Auth Code Flow process initiated by
   * /browser-automation-for-auth.
   *
   * It finalises the automation process by sending screenshots and any
   * other gathered information back to the client who first called
   * /browser-automation-for-auth.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  const cbRoute = async (req, res, next) => {
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
  };

  expressApp.post('/browser-automation-for-auth', browserAutomationForAuthRoute);
  expressApp.get('/auth', authRoute);
  expressApp.get('/cb', cbRoute);
}

module.exports = {
  setupBrowserAutomationRoutes,
};
