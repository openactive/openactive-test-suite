const { setupBrowserAutomationRoutes } = require('./browser-automation-for-auth');
const { recordWithIntercept, logWithIntercept } = require('./request-intercept');
const OpenActiveOpenIdTestClient = require('./client');
const OpenActiveTestAuthKeyManager = require('./auth-key-manager');
const FatalError = require('./fatal-error');

module.exports = {
  setupBrowserAutomationRoutes,
  recordWithIntercept,
  logWithIntercept,
  OpenActiveOpenIdTestClient,
  OpenActiveTestAuthKeyManager,
  FatalError,
};
