const { setupBrowserAutomationRoutes } = require('./lib/browser-automation-for-auth');
const { recordWithIntercept } = require('./lib/request-intercept');
const OpenActiveOpenIdTestClient = require('./lib/client');

module.exports = {
  setupBrowserAutomationRoutes,
  recordWithIntercept,
  OpenActiveOpenIdTestClient,
};
