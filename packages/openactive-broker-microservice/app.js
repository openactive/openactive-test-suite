const http = require('http');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const { setupBrowserAutomationRoutes } = require('@openactive/openactive-openid-browser-automation');

// Force TTY based on environment variable to ensure TTY output
if (process.env.FORCE_TTY === 'true' && process.env.FORCE_TTY_COLUMNS) {
  process.stdout.isTTY = true;
  process.stderr.isTTY = true;
  process.stdout.columns = parseInt(process.env.FORCE_TTY_COLUMNS, 10);
  process.stderr.columns = parseInt(process.env.FORCE_TTY_COLUMNS, 10);
}

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

const { silentlyAllowInsecureConnections } = require('./src/util/suppress-unauthorized-warning');
const { logError, log } = require('./src/util/log');
const {
  PORT,
  MICROSERVICE_BASE_URL,
  REQUEST_LOGGING_ENABLED,
  DO_NOT_FILL_BUCKETS,
  DISABLE_BROKER_TIMEOUT,
  BUTTON_SELECTORS,
} = require('./src/broker-config');
const { getIsOrderUuidPresentApi } = require('./src/order-uuid-tracking/api');
const { createOpportunityListenerApi, getOpportunityListenerApi, createOrderListenerApi, getOrderListenerApi } = require('./src/twoPhaseListeners/api');
const { state } = require('./src/state');
const {
  homepageRoute,
  healthCheckRoute,
  pauseRoute,
  getConfigRoute,
  getDatasetSiteRoute,
  getOrphansRoute,
  getStatusRoute,
  getValidationErrorsRoute,
  deleteOpportunityCacheRoute,
  getOpportunityCacheByIdRoute,
  getOpportunityByIdRoute,
  getRandomOpportunityRoute,
  deleteTestDatasetRoute,
  assertUnmatchedCriteriaRoute,
  getSampleOpportunitiesRoute,
  onHttpServerError,
  startPolling,
} = require('./src/core');

// Set NODE_TLS_REJECT_UNAUTHORIZED = '0' and suppress associated warning
silentlyAllowInsecureConnections();

const app = express();
app.use(express.json());
setupBrowserAutomationRoutes(app, BUTTON_SELECTORS);

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger('dev'));
}

// Provide helpful homepage as binding for root to allow the service to run in a container
app.get('/', homepageRoute);
app.get('/health-check', healthCheckRoute);
app.post('/pause', pauseRoute);
// Config endpoint used to get global variables within the integration tests
app.get('/config', getConfigRoute);
app.get('/dataset-site', getDatasetSiteRoute);
app.get('/orphans', getOrphansRoute);
app.get('/status', getStatusRoute);
app.get('/validation-errors', getValidationErrorsRoute);

app.delete('/opportunity-cache', deleteOpportunityCacheRoute);
app.get('/opportunity-cache/:id', getOpportunityCacheByIdRoute);

app.post('/opportunity-listeners/:id', createOpportunityListenerApi);
app.get('/opportunity-listeners/:id', getOpportunityListenerApi);
app.post('/order-listeners/:type/:bookingPartnerIdentifier/:uuid', createOrderListenerApi);
app.get('/order-listeners/:type/:bookingPartnerIdentifier/:uuid', getOrderListenerApi);

app.get('/is-order-uuid-present/:type/:bookingPartnerIdentifier/:uuid', getIsOrderUuidPresentApi);

app.get('/opportunity/:id', getOpportunityByIdRoute);

app.post('/test-interface/datasets/:testDatasetIdentifier/opportunities', getRandomOpportunityRoute);
app.delete('/test-interface/datasets/:testDatasetIdentifier', deleteTestDatasetRoute);

app.post('/assert-unmatched-criteria', assertUnmatchedCriteriaRoute);

// Sample Requests endpoint, used to underpin the Postman collection
app.get('/sample-opportunities', getSampleOpportunitiesRoute);

/* Ensure that processing the Dataset Site, and initiating polling on all the
feeds therein, delays the Broker Microservice from being "ready".
Note that this is done before the HTTP server starts listening, to ensure that
Broker Microservice does not briefly report itself as "ready" before feed
harvesting even starts */
state.incompleteFeeds.markFeedHarvestStarted('DatasetSite');

const server = http.createServer(app);
server.on('error', onHttpServerError);

app.listen(PORT, async () => {
  log(`Broker Microservice running on port ${PORT}

Check ${MICROSERVICE_BASE_URL}/status for current harvesting status
`);
  // if this has been run as a child process in the `npm start` script, `process.send` will be defined.
  if (process.send) {
    // Notify parent process that the server is up
    process.send('listening');
  }

  await state.persistentStore.init();

  // Start polling after HTTP server starts listening
  try {
    await startPolling();
  } catch (error) {
    logError(error.stack);
    process.exit(1);
  }
});

// Ensure bucket allocation does not become stale
setTimeout(() => {
  logError('\n------ WARNING: openactive-broker-microservice has been running for too long ------\n\nOpportunities are sorted into test-interface-criteria buckets based on the startDate of the opportunity when it is harvested. The means that the broker microservice must be restarted periodically to ensure its buckets allocation does not get stale. If bucket allocation becomes stale, tests will start to fail randomly.\n');
  if (!DISABLE_BROKER_TIMEOUT && !DO_NOT_FILL_BUCKETS) {
    const message = 'BROKER TIMEOUT: The openactive-broker-microservice has been running for too long and its bucket allocation is at risk of becoming stale. It must be restarted to continue.';
    logError(`${message}\n`);
    throw new Error(message);
  }
}, 3600000); // 3600000 ms = 1 hour
