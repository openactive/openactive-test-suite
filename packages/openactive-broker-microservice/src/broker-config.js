/**
 * Configuration used throughout Broker.
 */
const config = require('config');
const path = require('path');

const PORT = normalizePort(process.env.PORT || '3000');
const MICROSERVICE_BASE_URL = `http://localhost:${PORT}`;

const VALIDATE_ONLY = process.argv.includes('--validate-only');
const ITEM_VALIDATION_MODE = VALIDATE_ONLY ? 'RPDEFeed' : 'BookableRPDEFeed';

const DATASET_SITE_URL = VALIDATE_ONLY ? process.argv[3] : config.get('broker.datasetSiteUrl');
const REQUEST_LOGGING_ENABLED = config.get('broker.requestLogging');
const WAIT_FOR_HARVEST = VALIDATE_ONLY ? false : config.get('broker.waitForHarvestCompletion');
const VERBOSE = config.get('broker.verbose');
const OUTPUT_PATH = config.get('broker.outputPath');
const IS_RUNNING_IN_CI = config.has('ci') ? config.get('ci') : false;
// TODO: move this property to the root of the config
const USE_RANDOM_OPPORTUNITIES = config.get('integrationTests.useRandomOpportunities');

const HARVEST_START_TIME = (new Date()).toISOString();
/** @type {import('./models/core').OrderFeedIdentifier} */
const ORDERS_FEED_IDENTIFIER = 'OrdersFeed';
/** @type {import('./models/core').OrderFeedIdentifier} */
const ORDER_PROPOSALS_FEED_IDENTIFIER = 'OrderProposalsFeed';

// These options are not recommended for general use, but are available for specific test environment configuration and debugging
const OPPORTUNITY_FEED_REQUEST_HEADERS = config.has('broker.opportunityFeedRequestHeaders') ? config.get('broker.opportunityFeedRequestHeaders') : {};
const DATASET_OVERRIDE = config.has('broker.datasetOverride') ? config.get('broker.datasetOverride') : undefined;
const DO_NOT_FILL_BUCKETS = config.has('broker.disableBucketAllocation') ? config.get('broker.disableBucketAllocation') : false;
const DO_NOT_HARVEST_ORDERS_FEED = config.has('broker.disableOrdersFeedHarvesting') ? config.get('broker.disableOrdersFeedHarvesting') : false;
const DISABLE_BROKER_TIMEOUT = config.has('broker.disableBrokerMicroserviceTimeout') ? config.get('broker.disableBrokerMicroserviceTimeout') : false;
const LOG_AUTH_CONFIG = config.has('broker.logAuthConfig') ? config.get('broker.logAuthConfig') : false;

const BUTTON_SELECTORS = config.has('broker.loginPagesSelectors') ? config.get('broker.loginPagesSelectors') : {
  username: "[name='username' i]",
  password: "[name='password' i]",
  button: '.btn-primary',
};
const CONSOLE_OUTPUT_LEVEL = config.has('consoleOutputLevel') ? config.get('consoleOutputLevel') : 'detailed';
// TODO TODO TODO document this option
const IGNORE_RPDE_LICENSE_REQUIREMENT = config.has('broker.ignoreRpdeLicenseRequirement') ? config.get('broker.ignoreRpdeLicenseRequirement') : false;

const HEADLESS_AUTH = true;

/** Directory for Validator remote JSON cache (https://github.com/openactive/data-model-validator#remotejsoncachepath) */
const VALIDATOR_TMP_DIR = './tmp';
/** Input files for the Validator Worker Pool are saved in this directory */
const VALIDATOR_INPUT_TMP_DIR = path.join(__dirname, '..', 'tmp-validator-input');

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

module.exports = {
  PORT,
  MICROSERVICE_BASE_URL,
  VALIDATE_ONLY,
  ITEM_VALIDATION_MODE,
  DATASET_SITE_URL,
  REQUEST_LOGGING_ENABLED,
  WAIT_FOR_HARVEST,
  VERBOSE,
  OUTPUT_PATH,
  IS_RUNNING_IN_CI,
  USE_RANDOM_OPPORTUNITIES,
  HARVEST_START_TIME,
  ORDERS_FEED_IDENTIFIER,
  ORDER_PROPOSALS_FEED_IDENTIFIER,
  OPPORTUNITY_FEED_REQUEST_HEADERS,
  DATASET_OVERRIDE,
  DO_NOT_FILL_BUCKETS,
  DO_NOT_HARVEST_ORDERS_FEED,
  DISABLE_BROKER_TIMEOUT,
  LOG_AUTH_CONFIG,
  BUTTON_SELECTORS,
  CONSOLE_OUTPUT_LEVEL,
  IGNORE_RPDE_LICENSE_REQUIREMENT,
  HEADLESS_AUTH,
  VALIDATOR_TMP_DIR,
  VALIDATOR_INPUT_TMP_DIR,
};
