const { setupBrowserAutomationRoutes } = require('./lib/browser-automation-for-auth');
const { recordWithIntercept, logWithIntercept } = require('./lib/request-intercept');
const OpenActiveOpenIdTestClient = require('./lib/client');
const OpenActiveTestAuthKeyManager = require('./lib/auth-key-manager');
const FatalError = require('./lib/fatal-error');

module.exports = {
  setupBrowserAutomationRoutes,
  recordWithIntercept,
  logWithIntercept,
  OpenActiveOpenIdTestClient,
  OpenActiveTestAuthKeyManager,
  FatalError,
};
