/* eslint-disable no-use-before-define */
const express = require('express');
const http = require('http');
const logger = require('morgan');
const { default: axios } = require('axios');
const config = require('config');
const { criteria, testMatch } = require('@openactive/test-interface-criteria');
const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');
const chalk = require('chalk');
const { performance } = require('perf_hooks');
const { Base64 } = require('js-base64');
const sleep = require('util').promisify(setTimeout);
const { OpenActiveTestAuthKeyManager, setupBrowserAutomationRoutes, FatalError } = require('@openactive/openactive-openid-test-client');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const { Remarkable } = require('remarkable');
const mkdirp = require('mkdirp');
const cliProgress = require('cli-progress');
const AsyncValidatorWorker = require('./validator/async-validator');
const { suppress } = require('./src/util/suppress-unauthorized-warning');

const markdown = new Remarkable();

const DATASET_SITE_URL = config.get('datasetSiteUrl');
const REQUEST_LOGGING_ENABLED = config.get('requestLogging');
const WAIT_FOR_HARVEST = config.get('waitForHarvestCompletion');
const OUTPUT_PATH = config.get('outputPath');

const VERBOSE = config.get('verbose');
const HARVEST_START_TIME = new Date();

// These options are not recommended for general use, but are available for specific test environment configuration and debugging
const OPPORTUNITY_FEED_REQUEST_HEADERS = config.has('opportunityFeedRequestHeaders') ? config.get('opportunityFeedRequestHeaders') : {
};
const DATASET_DISTRIBUTION_OVERRIDE = config.has('datasetDistributionOverride') ? config.get('datasetDistributionOverride') : [];
const DO_NOT_FILL_BUCKETS = config.has('disableBucketAllocation') ? config.get('disableBucketAllocation') : false;
const DO_NOT_HARVEST_ORDERS_FEED = config.has('disableOrdersFeedHarvesting') ? config.get('disableOrdersFeedHarvesting') : false;
const DISABLE_BROKER_TIMEOUT = config.has('disableBrokerMicroserviceTimeout') ? config.get('disableBrokerMicroserviceTimeout') : false;
const LOG_AUTH_CONFIG = config.has('logAuthConfig') ? config.get('logAuthConfig') : false;
const BUTTON_SELECTOR = config.has('loginPageButtonSelector') ? config.get('loginPageButtonSelector') : '.btn-primary';

const PORT = normalizePort(process.env.PORT || '3000');
const MICROSERVICE_BASE_URL = `http://localhost:${PORT}`;
const HEADLESS_AUTH = true;

// Note this is duplicated between app.js and validator.js, for efficiency
const VALIDATOR_TMP_DIR = './tmp';

// Set NODE_TLS_REJECT_UNAUTHORIZED = '0' and suppress associated warning
suppress();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
app.use(express.json());
setupBrowserAutomationRoutes(app, BUTTON_SELECTOR);

// eslint-disable-next-line no-console
const logError = (x) => console.error(chalk.cyanBright(x));
// eslint-disable-next-line no-console
const log = (x) => console.log(chalk.cyan(x));

const globalAuthKeyManager = new OpenActiveTestAuthKeyManager(log, MICROSERVICE_BASE_URL, config.get('sellers'), config.get('bookingPartners'));

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger('dev'));
}

// nSQL joins appear to be slow, even with indexes. This is an optimisation pending further investigation
const parentOpportunityMap = new Map();
const parentOpportunityRpdeMap = new Map();
const opportunityMap = new Map();
const opportunityRpdeMap = new Map();
const rowStoreMap = new Map();
const parentIdIndex = new Map();

const startTime = new Date();

// create new progress bar container
let multibar = null;

let datasetSiteJson = {
};

const validatorThreadArray = [];
const validationResults = new Map();

/**
 * Use OpenActive validator to validate the opportunity
 *
 * @param {any} data opportunity JSON-LD object
 */
async function validateAndStoreValidationResults(data, validator) {
  const id = data['@id'] || data.id;
  const errors = await validator.validateItem(data);
  if (!errors) return;
  for (const error of errors) {
    // Use the first line of the error message to uniquely identify it
    const errorShortMessage = error.message.split('\n')[0];
    const errorKey = `${error.path}: ${errorShortMessage}`;

    // Ignore the error that a SessionSeries must have children as they haven't been combined yet.
    // This is being done because I don't know if there is a validator.validationMode for this, and without ignoring the broker does not run
    if (!(data['@type'] === 'SessionSeries' && errorShortMessage === 'A SessionSeries must have an eventSchedule or at least one subEvent.')) {
      // eslint-disable-next-line no-continue
      continue;
    }

    // Create a new entry if this is a new error
    let currentValidationResults = validationResults.get(errorKey);
    if (!currentValidationResults) {
      currentValidationResults = {
        path: error.path,
        message: errorShortMessage,
        occurrences: 0,
        examples: [],
      };
      validationResults.set(errorKey, currentValidationResults);
    }

    // Keep track of examples of each error, with a preference for newer ones (later in the feed)
    currentValidationResults.occurrences += 1;
    currentValidationResults.examples.unshift(id);
    if (currentValidationResults.examples.length > 5) {
      currentValidationResults.examples.pop();
    }
  }
}

/**
 * Render the currently stored validation errors as HTML
 */
async function renderValidationErrorsHtml() {
  return renderTemplate('validation-errors', {
    validationErrors: [...validationResults.entries()].map(([errorKey, obj]) => ({
      errorKey,
      ...obj,
    })),
  });
}

/**
 * Render a validator URL based on the cached data relating to the `@id`
 *
 * @param {string} id The `@id` of the JSON-LD object
 */
function renderOpenValidatorHref(id) {
  const cachedResponse = opportunityMap.get(id) || parentOpportunityMap.get(id);
  if (cachedResponse) {
    const jsonString = JSON.stringify(cachedResponse, null, 2);
    return `https://validator.openactive.io/?validationMode=BookableRPDEFeed#/json/${Base64.encodeURI(jsonString)}`;
  }
  return '';
}

/**
 * Render the specified Handlebars template with the supplied data
 *
 * @param {string} templateName Filename of the Handlebars template
 * @param {any} data JSON to pass into the Handlebars template
 */
async function renderTemplate(templateName, data) {
  const getTemplate = async (name) => {
    const file = await fs.readFile(`${__dirname}/templates/${name}.handlebars`, 'utf8');
    return Handlebars.compile(file);
  };

  const template = await getTemplate(templateName);

  return template(data, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true,
    helpers: {
      renderOpenValidatorHref,
      renderMarkdown: (text) => markdown.render(text),
    },
  });
}

// Buckets for criteria matches
/** @type {Map<string, Map<string, Map<string, Set<string>>>>} */
const matchingCriteriaOpportunityIds = new Map();
criteria.map((c) => c.name).forEach((criteriaName) => {
  const typeBucket = new Map();
  [
    'ScheduledSession',
    'FacilityUseSlot',
    'IndividualFacilityUseSlot',
    'CourseInstance',
    'HeadlineEvent',
    'Event',
    'HeadlineEventSubEvent',
    'CourseInstanceSubEvent',
    'OnDemandEvent',
  ].forEach((x) => typeBucket.set(x, new Map()));
  matchingCriteriaOpportunityIds.set(criteriaName, typeBucket);
});

const feedContextMap = new Map();

const testDatasets = new Map();
function getTestDataset(testDatasetIdentifier) {
  if (!testDatasets.has(testDatasetIdentifier)) {
    testDatasets.set(testDatasetIdentifier, new Set());
  }
  return testDatasets.get(testDatasetIdentifier);
}

function getAllDatasets() {
  return new Set(Array.from(testDatasets.values()).flatMap((x) => Array.from(x.values())));
}

/**
 * @param {string} baseUrl
 * @param {string} feedIdentifier
 * @param {() => Promise<Object.<string, string>>} headers
 * @param {RpdePageProcessor} processPage
 * @param {import('cli-progress').MultiBar} [bar]
 * @param {number} [totalItems]
 * @param {boolean} [waitForValidation]
 */
async function harvestRPDE(baseUrl, feedIdentifier, headers, processPage, doNotStallForThisFeed, bar, totalItems, waitForValidation) {
  // Limit validator to 5 minutes if WAIT_FOR_HARVEST is set
  const validatorTimeout = WAIT_FOR_HARVEST ? 1000 * 60 * 5 : null;
  const validator = new AsyncValidatorWorker(feedIdentifier, waitForValidation, startTime, validatorTimeout);
  validatorThreadArray.push(validator);

  let initialHarvestComplete = false;
  let numberOfRetries = 0;

  const context = {
    currentPage: baseUrl,
    pages: 0,
    items: 0,
    responseTimes: [],
    totalItemsQueuedForValidation: 0,
    validatedItems: 0,
  };
  const progressFromContext = (c) => ({
    totalItemsQueuedForValidation: c.totalItemsQueuedForValidation,
    validatedItems: c.validatedItems,
    validatedPercentage: c.totalItemsQueuedForValidation === 0 ? 0 : Math.round((c.validatedItems / c.totalItemsQueuedForValidation) * 100),
    items: c.items,
  });
  const progressbar = !bar ? null : bar.create(0, 0, {
    feedIdentifier,
    pages: 0,
    responseTime: '-',
    status: 'Harvesting...',
    ...progressFromContext(context),
  });

  if (feedContextMap.has(feedIdentifier)) {
    throw new Error('Duplicate feed identifier not permitted within dataset distribution.');
  }
  feedContextMap.set(feedIdentifier, context);
  let url = baseUrl;
  // Harvest forever, until a 404 is encountered
  for (;;) {
    try {
      const options = {
        headers: {
          Accept: 'application/json, application/vnd.openactive.booking+json; version=1',
          'Cache-Control': 'max-age=0',
          ...await headers() || {
          },
        },
      };

      const timerStart = performance.now();
      const response = await axios.get(url, options);
      const timerEnd = performance.now();
      const responseTime = timerEnd - timerStart;

      const json = response.data;

      // Validate RPDE base URL
      if (!json.next) {
        throw new Error("RPDE does not have 'next' property");
      }
      if (getBaseUrl(json.next) !== getBaseUrl(url)) {
        throw new Error(`(Base URL of RPDE 'next' property ("${getBaseUrl(json.next)}") does not match base URL of RPDE page ("${url}")`);
      }

      context.currentPage = url;
      if (json.next === url && json.items.length === 0) {
        if (!initialHarvestComplete && progressbar) {
          progressbar.update(context.validatedItems, {
            pages: context.pages,
            responseTime: Math.round(responseTime),
            ...progressFromContext(context),
            status: 'Harvesting Complete, Validating...',
          });
          progressbar.setTotal(context.totalItemsQueuedForValidation);
          initialHarvestComplete = true;
        }
        if (WAIT_FOR_HARVEST) {
          await setFeedIsUpToDate(feedIdentifier);
        } else if (VERBOSE) log(`Sleep mode poll for RPDE feed "${url}"`);
        context.sleepMode = true;
        if (context.timeToHarvestCompletion === undefined) context.timeToHarvestCompletion = millisToMinutesAndSeconds((new Date()).getTime() - startTime.getTime());
        await sleep(500);
      } else {
        context.responseTimes.push(responseTime);
        // Maintain a buffer of the last 5 items
        if (context.responseTimes.length > 5) context.responseTimes.shift();
        context.pages += 1;
        context.items += json.items.length;
        delete context.sleepMode;
        if (REQUEST_LOGGING_ENABLED) {
          const kind = json.items && json.items[0] && json.items[0].kind;
          log(
            `RPDE kind: ${kind}, page: ${context.pages}, length: ${
              json.items.length
            }, next: '${json.next}'`,
          );
        }
        // eslint-disable-next-line no-loop-func
        await processPage(json, feedIdentifier, (item) => {
          if (!initialHarvestComplete) {
            context.totalItemsQueuedForValidation += 1;
            validateAndStoreValidationResults(item, validator).then(() => {
              context.validatedItems += 1;
              if (progressbar) {
                progressbar.setTotal(context.totalItemsQueuedForValidation);
                if (context.totalItemsQueuedForValidation - context.validatedItems === 0) {
                  progressbar.update(context.validatedItems, {
                    ...progressFromContext(context),
                    status: 'Validation Complete',
                  });
                  progressbar.stop();
                } else {
                  progressbar.update(context.validatedItems, progressFromContext(context));
                }
              }
            });
          }
        });
        if (!initialHarvestComplete && progressbar) {
          progressbar.update(context.validatedItems, {
            pages: context.pages,
            responseTime: Math.round(responseTime),
            ...progressFromContext(context),
          });
          progressbar.setTotal(context.totalItemsQueuedForValidation);
        }
        url = json.next;
      }
      numberOfRetries = 0;
    } catch (error) {
      // Do not wait for the Orders feed if failing (as it might be an auth error)
      if (WAIT_FOR_HARVEST && doNotStallForThisFeed) {
        setFeedIsUpToDate(feedIdentifier);
      }
      if (error instanceof FatalError) {
        // If a fatal error, just rethrow
        throw error;
      } else if (!error.response) {
        log(`\nError for RPDE feed "${url}" (attempt ${numberOfRetries}): ${error.message}.\n${error.stack}`);
        // Force retry, after a delay, up to 12 times
        if (numberOfRetries < 12) {
          numberOfRetries += 1;
          await sleep(5000);
        } else {
          log(`\nFATAL ERROR: Retry limit exceeded for RPDE feed "${url}"\n`);
          // just rethrow
          throw error;
        }
      } else if (error.response.status === 404) {
        if (WAIT_FOR_HARVEST) await setFeedIsUpToDate(feedIdentifier);
        log(`\nNot Found error for RPDE feed "${url}", feed will be ignored.`);
        // Stop polling feed
        return;
      } else if (error.response.status === 401) {
        if (WAIT_FOR_HARVEST) await setFeedIsUpToDate(feedIdentifier);
        log(`\nNot authorised error for RPDE feed "${url}", feed will be ignored.`);
        // Stop polling feed
        return;
      } else {
        log(`\nError ${error.response.status} for RPDE page "${url}" (attempt ${numberOfRetries}): ${error.message}. Response: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data}`);
        // Force retry, after a delay, up to 12 times
        if (numberOfRetries < 12) {
          numberOfRetries += 1;
          await sleep(5000);
        } else {
          log(`\nFATAL ERROR: Retry limit exceeded for RPDE feed "${url}"\n`);
          // just rethrow
          throw error;
        }
      }
    }
  }
}

function getBaseUrl(url) {
  if (url.indexOf('//') > -1) {
    return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
  }
  throw new Error("RPDE 'next' property MUST be an absolute URL");
}

function getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier) {
  const criteriaBucket = matchingCriteriaOpportunityIds.get(criteriaName);
  if (!criteriaBucket) throw new Error('The specified testOpportunityCriteria is not currently supported.');
  const bucket = criteriaBucket.get(opportunityType);
  if (!bucket) throw new Error('The specified opportunity type is not currently supported.');
  const sellerCompartment = bucket.get(sellerId);
  if (!sellerCompartment) {
    return {
      sellers: Array.from(bucket.keys()),
    };
  } // Seller has no items

  const allTestDatasets = getAllDatasets();
  const unusedBucketItems = Array.from(sellerCompartment).filter((x) => !allTestDatasets.has(x));

  if (unusedBucketItems.length === 0) return null;

  const id = unusedBucketItems[Math.floor(Math.random() * unusedBucketItems.length)];

  // Add the item to the testDataset to ensure it does not get reused
  getTestDataset(testDatasetIdentifier).add(id);

  return {
    opportunity: {
      '@context': 'https://openactive.io/',
      '@type': getTypeFromOpportunityType(opportunityType),
      '@id': id,
    },
  };
}

/**
 * @param {string} opportunityType
 * @param {string} criteriaName
 */
function assertOpportunityCriteriaNotFound(opportunityType, criteriaName) {
  const criteriaBucket = matchingCriteriaOpportunityIds.get(criteriaName);
  if (!criteriaBucket) throw new Error('The specified testOpportunityCriteria is not currently supported.');
  const bucket = criteriaBucket.get(opportunityType);
  if (!bucket) throw new Error('The specified opportunity type is not currently supported.');

  // Check that all sellerCompartments are empty
  return Array.from(bucket).every(([, items]) => (items.size === 0));
}

function releaseOpportunityLocks(testDatasetIdentifier) {
  const testDataset = getTestDataset(testDatasetIdentifier);
  log(`Cleared dataset '${testDatasetIdentifier}' of opportunity locks ${Array.from(testDataset).join(', ')}`);
  testDataset.clear();
}

function getOpportunityById(opportunityId) {
  const opportunity = opportunityMap.get(opportunityId);
  if (!opportunity) {
    return null;
  }
  const superEvent = parentOpportunityMap.get(opportunity.superEvent);
  const facilityUse = parentOpportunityMap.get(opportunity.facilityUse);
  if (opportunity && (superEvent || facilityUse)) {
    const mergedContexts = getMergedJsonLdContext(opportunity, superEvent, facilityUse);
    delete opportunity['@context'];
    const returnObj = {
      '@context': mergedContexts,
      ...opportunity,
    };
    if (superEvent) {
      const superEventWithoutContext = {
        ...superEvent,
      };
      delete superEventWithoutContext['@context'];
      return {
        ...returnObj,
        superEvent: superEventWithoutContext,
      };
    }
    if (facilityUse) {
      const facilityUseWithoutContext = {
        ...facilityUse,
      };
      delete facilityUseWithoutContext['@context'];
      return {
        ...returnObj,
        facilityUse: facilityUseWithoutContext,
      };
    }
  }
  return null;
}

/**
 * @typedef {Object} PendingResponse
 * @property {(json: any) => void} send
 * @property {() => void} cancel
 */

/** @type {{[id: string]: PendingResponse}} */
const responses = {
};

const healthCheckResponsesWaitingForHarvest = [];
const incompleteFeeds = [];

function addFeed(feedUrl) {
  incompleteFeeds.push(feedUrl);
}

async function setFeedIsUpToDate(feedIdentifier) {
  if (incompleteFeeds.length !== 0) {
    const index = incompleteFeeds.indexOf(feedIdentifier);
    if (index > -1) {
      // Remove the feed from the list
      incompleteFeeds.splice(index, 1);

      // If the list is now empty, trigger responses to healthcheck
      if (incompleteFeeds.length === 0) {
        // Stop the validator threads as soon as we've finished harvesting - so only a subset of the results will be validated
        // Note in some circumstances threads will complete their work before terminating
        await Promise.all(validatorThreadArray.map(async (validator) => validator.terminate));

        if (multibar) multibar.stop();

        log('Harvesting is up-to-date');
        const { childOrphans, totalChildren, percentageChildOrphans } = getOrphanStats();

        if (totalChildren === 0) {
          logError('\nFATAL ERROR: Zero opportunities could be harvested from the opportunities feeds.');
          logError('Please ensure that the opportunities feeds conform to RPDE using https://validator.openactive.io/rpde.\n');
          throw new FatalError('Zero opportunities could be harvested from the opportunities feeds');
        } else if (childOrphans === totalChildren) {
          logError(`\nFATAL ERROR: 100% of the ${totalChildren} harvested opportunities do not have a matching parent item from the parent feed, so all integration tests will fail.`);
          logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
          logError(`Visit http://localhost:${PORT}/orphans for more information\n`);
          // Sleep for 1 minute to allow the user to access the /orphans page, before throwing the fatal error
          // User interaction is not required to exit, for compatibility with CI
          await sleep(60000);
          throw new FatalError('100% of the harvested opportunities do not have a matching parent item from the parent feed');
        } else if (childOrphans > 0) {
          logError(`\nWARNING: ${childOrphans} of ${totalChildren} opportunities (${percentageChildOrphans}%) do not have a matching parent item from the parent feed.`);
          logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
          logError(`Visit http://localhost:${PORT}/orphans for more information\n`);
        }

        if (validationResults.size > 0) {
          await fs.writeFile(`${OUTPUT_PATH}validation-errors.html`, await renderValidationErrorsHtml());
          const occurrenceCount = [...validationResults.values()].reduce((total, result) => total + result.occurrences, 0);
          logError(`\nFATAL ERROR: Validation errors were found in the opportunity data feeds. ${occurrenceCount} errors were reported of which ${validationResults.size} were unique.`);
          logError(`Open ${OUTPUT_PATH}validation-errors.html or http://localhost:${PORT}/validation-errors in your browser for more information\n`);
          // Sleep for 1 minute to allow the user to access the /orphans page, before throwing the fatal error
          // User interaction is not required to exit, for compatibility with CI
          await sleep(60000);
          throw new FatalError(`Validation errors found in opportunity feeds (${occurrenceCount} of which ${validationResults.size} were unique)`);
        }

        unlockHealthCheck();
      }
    }
  }
}

function unlockHealthCheck() {
  healthCheckResponsesWaitingForHarvest.forEach((res) => res.send('openactive-broker'));
  // Clear response array
  healthCheckResponsesWaitingForHarvest.splice(0, healthCheckResponsesWaitingForHarvest.length);
  // Clear incompleteFeeds array
  incompleteFeeds.splice(0, incompleteFeeds.length);
}

// Provide helpful homepage as binding for root to allow the service to run in a container
// @ts-ignore
app.get('/', (req, res) => {
  res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>OpenActive Test Suite - Broker Microservice</title>
</head>

<body>
  <h1>OpenActive Test Suite - Broker Microservice</h1>
  <a href="/status">Status Page</a>
  <a href="/validation-errors">Validation Errors</a>
</body>
</html>`);
});

app.get('/health-check', function (req, res) {
  // Healthcheck response will block until all feeds are up-to-date, which is useful in CI environments
  // to ensure that the tests will not run until the feeds have been fully consumed
  // Allow blocking for up to 10 minutes to fully harvest the feed
  req.setTimeout(1000 * 60 * 10);
  if (WAIT_FOR_HARVEST && incompleteFeeds.length !== 0) {
    healthCheckResponsesWaitingForHarvest.push(res);
  } else {
    res.send('openactive-broker');
  }
});

function getConfig() {
  return {
    // Allow a consistent startDate to be used when calling test-interface-criteria
    harvestStartTime: HARVEST_START_TIME.toISOString(),
    // Base URL used by the integration tests
    bookingApiBaseUrl: datasetSiteJson.accessService?.endpointURL,
    // Base URL used by the authentication tests
    authenticationAuthority: datasetSiteJson.accessService?.authenticationAuthority,
    ...globalAuthKeyManager.config,
    headlessAuth: HEADLESS_AUTH,
  };
}

async function getOrdersFeedHeader() {
  await globalAuthKeyManager.refreshClientCredentialsAccessTokensIfNeeded();
  const accessToken = getConfig()?.bookingPartnersConfig?.primary?.authentication?.orderFeedTokenSet?.access_token;
  const requestHeaders = getConfig()?.bookingPartnersConfig?.primary?.authentication?.ordersFeedRequestHeaders;
  return {
    ...(!accessToken ? undefined : {
      Authorization: `Bearer ${accessToken}`,
    }),
    ...requestHeaders,
  };
}

// Config endpoint used to get global variables within the integration tests
app.get('/config', async function (req, res) {
  await globalAuthKeyManager.refreshAuthorizationCodeFlowAccessTokensIfNeeded();
  res.json(getConfig());
});

app.get('/dataset-site', function (req, res) {
  res.json(datasetSiteJson);
});

function mapToObject(map) {
  if (map instanceof Map) {
    // Return a object representation of a Map
    return Object.assign(Object.create(null), ...[...map].map((v) => (typeof v[1] === 'object' && v[1].size === 0 ? {
    } : {
      [v[0]]: mapToObject(v[1]),
    })));
  } if (map instanceof Set) {
    // Return just the size of a Set, to render at the leaf nodes of the resulting tree,
    // instead of outputting the whole set contents. This reduces the size of the output for display.
    return map.size;
  }
  return map;
}

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(0)}`;
}

app.get('/orphans', function (req, res) {
  const rows = Array.from(rowStoreMap.values());
  res.send({
    children: {
      matched: rows.filter((x) => x.parentIngested).length,
      orphaned: rows.filter((x) => !x.parentIngested).length,
      total: rows.length,
      orphanedList: rows.filter((x) => !x.parentIngested).slice(0, 1000).map((({ jsonLdType, id, modified, jsonLd, jsonLdId, jsonLdParentId }) => ({
        jsonLdType,
        id,
        modified,
        jsonLd,
        jsonLdId,
        jsonLdParentId,
      }))),
    },
  });
});

/**
 * @typedef {Object} OrphanStats
 * @property {number} childOrphans
 * @property {number} totalChildren
 * @property {string} percentageChildOrphans
 */

/**
 * @returns {OrphanStats}
 */
function getOrphanStats() {
  const childOrphans = Array.from(rowStoreMap.values()).filter((x) => !x.parentIngested).length;
  const totalChildren = rowStoreMap.size;
  const percentageChildOrphans = totalChildren > 0 ? ((childOrphans / totalChildren) * 100).toFixed(2) : '0';
  return {
    childOrphans,
    totalChildren,
    percentageChildOrphans,
  };
}

app.get('/status', function (req, res) {
  const { childOrphans, totalChildren, percentageChildOrphans } = getOrphanStats();
  res.send({
    elapsedTime: millisToMinutesAndSeconds((new Date()).getTime() - startTime.getTime()),
    feeds: mapToObject(feedContextMap),
    orphans: {
      children: `${childOrphans} of ${totalChildren} (${percentageChildOrphans}%)`,
    },
    buckets: DO_NOT_FILL_BUCKETS ? null : mapToObject(matchingCriteriaOpportunityIds),
  });
});

app.get('/validation-errors', async function (req, res) {
  res.send(await renderValidationErrorsHtml());
});

app.get('/opportunity-cache/:id', function (req, res) {
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityById(id);

    if (cachedResponse) {
      log(`Used cache for "${id}"`);
      res.json({
        data: cachedResponse,
      });
    } else {
      res.status(404).json({
        error: `Opportunity with id "${id}" was not found`,
      });
    }
  } else {
    res.status(400).json({
      error: 'id is required',
    });
  }
});

app.get('/opportunity/:id', function (req, res) {
  const useCacheIfAvailable = req.query.useCacheIfAvailable === 'true';

  // respond with json
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityById(id);

    if (useCacheIfAvailable && cachedResponse) {
      log(`used cached response for "${id}"`);
      res.json({
        data: cachedResponse,
      });
    } else {
      log(`listening for "${id}"`);

      // Stash the response and reply later when an event comes through (kill any existing id still waiting)
      if (responses[id] && responses[id] !== null) responses[id].cancel();
      responses[id] = {
        send(json) {
          responses[id] = null;
          res.json(json);
        },
        cancel() {
          log(`Ignoring previous request for "${id}"`);
          res.status(400).json({
            error: `A newer request to wait for "${id}" has been received, so this request has been cancelled.`,
          });
        },
      };
    }
  } else {
    res.status(400).json({
      error: 'id is required',
    });
  }
});

function getTypeFromOpportunityType(opportunityType) {
  const mapping = {
    ScheduledSession: 'ScheduledSession',
    FacilityUseSlot: 'Slot',
    IndividualFacilityUseSlot: 'Slot',
    CourseInstance: 'CourseInstance',
    HeadlineEvent: 'HeadlineEvent',
    Event: 'Event',
    HeadlineEventSubEvent: 'Event',
    CourseInstanceSubEvent: 'Event',
    OnDemandEvent: 'OnDemandEvent',
  };
  return mapping[opportunityType];
}

function detectSellerId(opportunity) {
  const organizer = opportunity.organizer
    || (opportunity.superEvent
      && (opportunity.superEvent.organizer || (opportunity.superEvent.superEvent && opportunity.superEvent.superEvent.organizer)))
    || (opportunity.facilityUse && opportunity.facilityUse.provider);

  return organizer['@id'] || organizer.id;
}

function detectOpportunityType(opportunity) {
  switch (opportunity['@type'] || opportunity.type) {
    case 'ScheduledSession':
      if (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type) === 'SessionSeries') {
        return 'ScheduledSession';
      }
      throw new Error('ScheduledSession must have superEvent of SessionSeries');

    case 'Slot':
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'IndividualFacilityUse') {
        return 'IndividualFacilityUseSlot';
      }
      if (opportunity.facilityUse && (opportunity.facilityUse['@type'] || opportunity.facilityUse.type) === 'FacilityUse') {
        return 'FacilityUseSlot';
      }

      throw new Error('Slot must have facilityUse of FacilityUse or IndividualFacilityUse');

    case 'CourseInstance':
      return 'CourseInstance';
    case 'HeadlineEvent':
      return 'HeadlineEvent';
    case 'OnDemandEvent':
      return 'OnDemandEvent';
    case 'Event':
      switch (opportunity.superEvent && (opportunity.superEvent['@type'] || opportunity.superEvent.type)) {
        case 'HeadlineEvent':
          return 'HeadlineEventSubEvent';
        case 'CourseInstance':
          return 'CourseInstanceSubEvent';
        case 'EventSeries':
        case null:
          return 'Event';
        default:
          throw new Error('Event has unrecognised @type of superEvent');
      }
    default:
      throw new Error('Only bookable opportunities are permitted in the test interface');
  }
}

app.post('/test-interface/datasets/:testDatasetIdentifier/opportunities', function (req, res) {
  if (DO_NOT_FILL_BUCKETS) {
    res.status(403).json({
      error: 'Test interface is not available as \'disableBucketAllocation\' is set to \'true\' in openactive-broker-microservice configuration.',
    });
    return;
  }

  // Use :testDatasetIdentifier to ensure the same id is not returned twice
  const { testDatasetIdentifier } = req.params;

  const opportunity = req.body;
  const opportunityType = detectOpportunityType(opportunity);
  const sellerId = detectSellerId(opportunity);
  const criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');

  const result = getRandomBookableOpportunity(sellerId, opportunityType, criteriaName, testDatasetIdentifier);
  if (result && result.opportunity) {
    log(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${result.opportunity['@type']}): ${result.opportunity['@id']}`);
    res.json(result.opportunity);
  } else {
    logError(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} (${opportunityType}) call failed: No matching opportunities found`);
    res.status(404).json({
      error: `Opportunity Type '${opportunityType}' Not found from seller ${sellerId} for ${criteriaName}.\n\nSellers available:\n${result && result.sellers && result.sellers.length > 0 ? result.sellers.join('\n') : 'none'}.`,
    });
  }
});

app.delete('/test-interface/datasets/:testDatasetIdentifier', function (req, res) {
  // Use :testDatasetIdentifier to identify locks, and clear them
  const { testDatasetIdentifier } = req.params;
  releaseOpportunityLocks(testDatasetIdentifier);
  res.status(204).send();
});

app.post('/assert-unmatched-criteria', function (req, res) {
  if (DO_NOT_FILL_BUCKETS) {
    res.status(403).json({
      error: 'Bucket functionality is not available as \'disableBucketAllocation\' is set to \'true\' in openactive-broker-microservice configuration.',
    });
    return;
  }

  const opportunity = req.body;
  const opportunityType = detectOpportunityType(opportunity);
  const criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');

  const result = assertOpportunityCriteriaNotFound(opportunityType, criteriaName);

  if (result) {
    log(`Asserted that no opportunities match ${criteriaName} (${opportunityType}).`);
    res.status(204).send();
  } else {
    logError(`Call failed for "/assert-unmatched-criteria" for ${criteriaName} (${opportunityType}): Matching opportunities found.`);
    res.status(404).json({
      error: `Assertion not available: opportunities exist that match '${criteriaName}' for Opportunity Type '${opportunityType}'.`,
    });
  }
});

/** @type {{[id: string]: PendingResponse}} */
const orderResponses = {
};

app.get('/get-order/:orderUuid', function (req, res) {
  if (DO_NOT_HARVEST_ORDERS_FEED) {
    res.status(403).json({
      error: 'Order feed items are not available as \'disableOrdersFeedHarvesting\' is set to \'true\' in openactive-broker-microservice configuration.',
    });
  } else if (req.params.orderUuid) {
    const { orderUuid } = req.params;

    // Stash the response and reply later when an event comes through (kill any existing orderUuid still waiting)
    if (orderResponses[orderUuid] && orderResponses[orderUuid] !== null) orderResponses[orderUuid].cancel();
    orderResponses[orderUuid] = {
      send(json) {
        orderResponses[orderUuid] = null;
        res.json(json);
      },
      cancel() {
        log(`Ignoring previous request for "${orderUuid}"`);
        res.status(400).json({
          error: `A newer request to wait for "${orderUuid}" has been received, so this request has been cancelled.`,
        });
      },
    };
  } else {
    res.status(400).json({
      error: 'orderUuid is required',
    });
  }
});

/**
 * @callback RpdePageProcessor
 * @param {any} rpdePage
 * @param {string} feedIdentifier
 * @param {ValidateItemCallback} validateItemFn
 */

/**
 * @callback ValidateItemCallback
 * @param {any} data
 */

/** @type {RpdePageProcessor} */
async function ingestParentOpportunityPage(rpdePage, feedIdentifier, validateItemFn) {
  const feedPrefix = `${feedIdentifier}---`;
  for (const item of rpdePage.items) {
    const feedItemIdentifier = feedPrefix + item.id;
    if (item.state === 'deleted') {
      const jsonLdId = parentOpportunityRpdeMap.get(feedItemIdentifier);
      parentOpportunityMap.delete(jsonLdId);
      parentOpportunityRpdeMap.delete(feedItemIdentifier);
    } else {
      // Run any validation logic for this item
      await validateItemFn(item.data);

      const jsonLdId = item.data['@id'] || item.data.id;
      parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      parentOpportunityMap.set(jsonLdId, item.data);
    }
  }

  // As these parent opportunities have been updated, update all child items for these parent IDs
  await touchOpportunityItems(rpdePage.items
    .filter((item) => item.state !== 'deleted')
    .map((item) => item.data['@id'] || item.data.id));
}

/** @type {RpdePageProcessor} */
async function ingestOpportunityPage(rpdePage, feedIdentifier, validateItemFn) {
  const feedPrefix = `${feedIdentifier}---`;
  for (const item of rpdePage.items) {
    const feedItemIdentifier = feedPrefix + item.id;
    if (item.state === 'deleted') {
      const jsonLdId = opportunityRpdeMap.get(feedItemIdentifier);
      opportunityMap.delete(jsonLdId);
      opportunityRpdeMap.delete(feedItemIdentifier);

      deleteOpportunityItem(jsonLdId);
    } else {
      // Run any validation logic for this item
      await validateItemFn(item.data);

      const jsonLdId = item.data['@id'] || item.data.id;
      opportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      opportunityMap.set(jsonLdId, item.data);

      await storeOpportunityItem(item);
    }
  }
}

async function touchOpportunityItems(parentIds) {
  const opportunitiesToUpdate = new Set();

  parentIds.forEach((parentId) => {
    if (parentIdIndex.has(parentId)) {
      parentIdIndex.get(parentId).forEach((jsonLdId) => {
        opportunitiesToUpdate.add(jsonLdId);
      });
    }
  });

  await Promise.all([...opportunitiesToUpdate].map(async (jsonLdId) => {
    if (rowStoreMap.has(jsonLdId)) {
      const row = rowStoreMap.get(jsonLdId);
      row.feedModified = Date.now() + 1000; // 1 second in the future
      row.parentIngested = true;
      await processRow(row);
    }
  }));
}

function deleteOpportunityItem(jsonLdId) {
  const row = rowStoreMap.get(jsonLdId);
  if (row) {
    const idx = parentIdIndex.get(row.jsonLdParentId);
    if (idx) {
      idx.delete(jsonLdId);
    }
    rowStoreMap.delete(jsonLdId);
  }
}

async function storeOpportunityItem(item) {
  const row = {
    id: item.id,
    modified: item.modified,
    deleted: item.state === 'deleted',
    feedModified: Date.now() + 1000, // 1 second in the future,
    jsonLdId: item.state === 'deleted' ? null : item.data['@id'] || item.data.id,
    jsonLd: item.state === 'deleted' ? null : item.data,
    jsonLdType: item.state === 'deleted' ? null : item.data['@type'] || item.data.type,
    jsonLdParentId: item.state === 'deleted' ? null : item.data.superEvent || item.data.facilityUse,
    parentIngested: item.state === 'deleted' ? false : parentOpportunityMap.has(item.data.superEvent) || parentOpportunityMap.has(item.data.facilityUse),
  };

  if (row.jsonLdParentId != null && row.jsonLdId != null) {
    if (!parentIdIndex.has(row.jsonLdParentId)) parentIdIndex.set(row.jsonLdParentId, new Set());
    parentIdIndex.get(row.jsonLdParentId).add(row.jsonLdId);
  }

  rowStoreMap.set(row.jsonLdId, row);

  if (row.parentIngested) {
    await processRow(row);
  }
}

function sortWithOpenActiveOnTop(arr) {
  const firstList = [];
  if (arr.includes('https://openactive.io/')) firstList.push('https://openactive.io/');
  if (arr.includes('https://schema.org/')) firstList.push('https://schema.org/');
  const remainingList = arr.filter((x) => x !== 'https://openactive.io/' && x !== 'https://schema.org/');
  return firstList.concat(remainingList.sort());
}

function getMergedJsonLdContext(...contexts) {
  return sortWithOpenActiveOnTop([...new Set(contexts.map((x) => x && x['@context']).filter((x) => x).flat())]);
}

async function processRow(row) {
  const parentOpportunity = parentOpportunityMap.get(row.jsonLdParentId);
  const mergedContexts = getMergedJsonLdContext(row.jsonLd, parentOpportunity);

  const parentOpportunityWithoutContext = {
    ...parentOpportunity,
  };
  delete parentOpportunityWithoutContext['@context'];

  const rowJsonLdWithoutContext = {
    ...row.jsonLd,
  };
  delete rowJsonLdWithoutContext['@context'];

  let newItem = {
    state: row.deleted ? 'deleted' : 'updated',
    id: row.jsonLdId,
    modified: row.feedModified,
    data: {
      '@context': mergedContexts,
      ...rowJsonLdWithoutContext,
    },
  };

  if (row.jsonLdType === 'Slot') {
    newItem = {
      ...newItem,
      data: {
        ...newItem.data,
        facilityUse: parentOpportunityWithoutContext,
      },
    };
  } else {
    newItem = {
      ...newItem,
      data: {
        ...newItem.data,
        superEvent: parentOpportunityWithoutContext,
      },
    };
  }

  await processOpportunityItem(newItem);
}

async function processOpportunityItem(item) {
  if (item.data) {
    const id = item.data['@id'] || item.data.id;

    // Fill buckets
    const matchingCriteria = [];
    let unmetCriteriaDetails = [];

    if (!DO_NOT_FILL_BUCKETS) {
      const opportunityType = detectOpportunityType(item.data);
      const sellerId = detectSellerId(item.data);

      criteria.map((c) => ({
        criteriaName: c.name,
        criteriaResult: testMatch(c, item.data, {
          harvestStartTime: HARVEST_START_TIME,
        }),
      })).forEach((result) => {
        const bucket = matchingCriteriaOpportunityIds.get(result.criteriaName).get(opportunityType);
        if (!bucket.has(sellerId)) bucket.set(sellerId, new Set());
        const sellerCompartment = bucket.get(sellerId);
        if (result.criteriaResult.matchesCriteria) {
          sellerCompartment.add(id);
          matchingCriteria.push(result.criteriaName);
        } else {
          sellerCompartment.delete(id);
          unmetCriteriaDetails = unmetCriteriaDetails.concat(result.criteriaResult.unmetCriteriaDetails);
        }
      });
    }

    const bookableIssueList = unmetCriteriaDetails.length > 0
      ? `\n   [Unmet Criteria: ${Array.from(new Set(unmetCriteriaDetails)).join(', ')}]` : '';

    if (responses[id]) {
      responses[id].send(item);

      if (VERBOSE) log(`seen ${matchingCriteria.join(', ')} and dispatched ${id}${bookableIssueList}`);
    } else if (VERBOSE) log(`saw ${matchingCriteria.join(', ')} ${id}${bookableIssueList}`);
  }
}

/** @type {RpdePageProcessor} */
async function monitorOrdersPage(rpde) {
  rpde.items.forEach((item) => {
    if (item.id && orderResponses[item.id]) {
      orderResponses[item.id].send(item);
    }
  });
}

function extractJSONLDfromHTML(url, html) {
  let jsonld = null;

  const handler = new Handler(
    (err, result) => {
      if (!err && typeof result === 'object') {
        const jsonldArray = result.jsonld;
        // Use the first JSON-LD block on the page
        if (Array.isArray(jsonldArray) && jsonldArray.length > 0) {
          [jsonld] = jsonldArray;
        }
      }
    },
    {
      url, // The HTML pages URL is used to resolve relative URLs. TODO: Remove this
    },
  );

  // Create a HTML parser with the handler.
  const parser = new Parser(handler, {
    decodeEntities: true,
  });
  parser.write(html);
  parser.done();

  return jsonld;
}

async function extractJSONLDfromDatasetSiteUrl(url) {
  if (DATASET_DISTRIBUTION_OVERRIDE.length > 0) {
    log('Simulating Dataset Site based on datasetDistributionOverride config setting...');
    return {
      distribution: DATASET_DISTRIBUTION_OVERRIDE,
    };
  }
  try {
    log(`Downloading Dataset Site JSON-LD from "${url}"...`);
    const response = await axios.get(url);

    const jsonld = extractJSONLDfromHTML(url, response.data);
    return jsonld;
  } catch (error) {
    if (!error.response) {
      logError(`\nError while extracting JSON-LD from datasetSiteUrl "${url}"\n`);
      throw error;
    } else {
      throw new Error(`Error ${error.response.status} for datasetSiteUrl "${url}": ${error.message}. Response: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data}`);
    }
  }
}

async function startPolling() {
  await mkdirp(VALIDATOR_TMP_DIR);
  await mkdirp(OUTPUT_PATH);

  const dataset = await extractJSONLDfromDatasetSiteUrl(DATASET_SITE_URL);

  log(`Dataset Site JSON-LD: ${JSON.stringify(dataset, null, 2)}`);

  // Set global based on data result
  datasetSiteJson = dataset;

  if (!dataset || !Array.isArray(dataset.distribution)) {
    throw new Error('Unable to read valid JSON-LD from Dataset Site. Please try loading the Dataset Site URL in validator.openactive.io to confirm it is valid.');
  }

  if (dataset.accessService?.authenticationAuthority) {
    try {
      await globalAuthKeyManager.initialise(dataset.accessService.authenticationAuthority, HEADLESS_AUTH);
    } catch (error) {
      if (error instanceof FatalError) {
        // If a fatal error, just rethrow
        throw error;
      }
      logError(`
OpenID Connect Authentication Error: ${error.stack}




***************************************************************************
|                   OpenID Connect Authentication Error!                  |
|                                                                         |
| NOTE: Due to OpenID Connect Authentication failure, tests unrelated to  |
| authentication will not run and open data harvesting will be skipped.   |
| Please use the 'authentication' tests to debug authentication,          |
| in order to allow other tests to run.                                   |
|                                                                         |
***************************************************************************



`);
      // Skip harvesting
      unlockHealthCheck();
      return;
    }
  } else {
    log('\nWarning: Open ID Connect Identity Server (accessService.authenticationAuthority) not found in dataset site');
  }

  if (LOG_AUTH_CONFIG) log(`\nAugmented config supplied to Integration Tests: ${JSON.stringify(getConfig(), null, 2)}\n`);

  const harvesters = [];

  const isParentFeed = {
    'https://openactive.io/SessionSeries': true,
    'https://openactive.io/FacilityUse': true,
    'https://openactive.io/IndividualFacilityUse': true,
    'https://openactive.io/ScheduledSession': false,
    'https://openactive.io/Slot': false,
    'https://schema.org/Event': false,
    'https://schema.org/OnDemandEvent': false,
  };

  const hasTotalItems = dataset.distribution.filter((x) => x.totalItems).length > 0;
  multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    noTTYOutput: true,
    emptyOnZero: true,
    etaBuffer: 500,
    format: hasTotalItems
      ? '{feedIdentifier} [{bar}] {percentage}% | ETA: {eta_formatted} | {value}/{total} | Response time: {responseTime}ms | Elapsed: {duration_formatted} | Validated: {validatedItems} of {totalItemsQueuedForValidation} ({validatedPercentage}%) | Status: {status}'
      : '{feedIdentifier} | {items} items harvested from {pages} pages | Response time: {responseTime}ms | Elapsed: {duration_formatted} | Validated: {value} of {total} ({percentage}%) ETA: {eta_formatted} | Status: {status}',
  }, cliProgress.Presets.shades_grey);

  dataset.distribution.forEach((dataDownload) => {
    const feedIdentifier = dataDownload.identifier || dataDownload.name || dataDownload.additionalType;
    if (isParentFeed[dataDownload.additionalType] === true) {
      log(`Found parent opportunity feed: ${dataDownload.contentUrl}`);
      addFeed(feedIdentifier);
      harvesters.push(harvestRPDE(dataDownload.contentUrl, feedIdentifier, async () => OPPORTUNITY_FEED_REQUEST_HEADERS, ingestParentOpportunityPage, false, multibar, dataDownload.totalItems, true));
    } else if (isParentFeed[dataDownload.additionalType] === false) {
      log(`Found opportunity feed: ${dataDownload.contentUrl}`);
      addFeed(feedIdentifier);
      harvesters.push(harvestRPDE(dataDownload.contentUrl, feedIdentifier, async () => OPPORTUNITY_FEED_REQUEST_HEADERS, ingestOpportunityPage, false, multibar, dataDownload.totalItems, false));
    } else {
      logError(`\nERROR: Found unsupported feed in dataset site "${dataDownload.contentUrl}" with additionalType "${dataDownload.additionalType}"`);
      logError(`Only the following additionalType values are supported: \n${Object.keys(isParentFeed).map((x) => `- "${x}"`).join('\n')}'`);
    }
  });

  // Only poll orders feed if included in the dataset site
  if (!DO_NOT_HARVEST_ORDERS_FEED && dataset.accessService && dataset.accessService.endpointURL) {
    const feedIdentifier = 'OrdersFeed';
    const ordersFeedUrl = `${dataset.accessService.endpointURL}/orders-rpde`;
    log(`Found orders feed: ${ordersFeedUrl}`);
    addFeed(feedIdentifier);
    harvesters.push(harvestRPDE(ordersFeedUrl, feedIdentifier, getOrdersFeedHeader, monitorOrdersPage, true));
  }

  // Finished processing dataset site
  if (WAIT_FOR_HARVEST) log('\nBlocking integration tests to wait for harvest completion...');
  await setFeedIsUpToDate('DatasetSite');

  // Wait until all harvesters error catastrophically before existing
  await Promise.all(harvesters);
}

// Ensure that dataset site request also delays "readiness"
addFeed('DatasetSite');

// Ensure bucket allocation does not become stale
setTimeout(() => {
  logError('\n------ WARNING: openactive-broker-microservice has been running for too long ------\n\nOpportunities are sorted into test-interface-criteria buckets based on the startDate of the opportunity when it is harvested. The means that the broker microservice must be restarted periodically to ensure its buckets allocation does not get stale. If bucket allocation becomes stale, tests will start to fail randomly.\n');
  if (!DISABLE_BROKER_TIMEOUT && !DO_NOT_FILL_BUCKETS) {
    const message = 'BROKER TIMEOUT: The openactive-broker-microservice has been running for too long and its bucket allocation is at risk of becoming stale. It must be restarted to continue.';
    logError(`${message}\n`);
    throw new Error(message);
  }
}, 3600000); // 3600000 ms = 1 hour

const server = http.createServer(app);
server.on('error', onError);

app.listen(PORT, () => {
  log(`Broker Microservice running on port ${PORT}

Check ${MICROSERVICE_BASE_URL}/status for current harvesting status
`);
  // Start polling after HTTP server starts listening
  (async () => {
    try {
      await startPolling();
    } catch (error) {
      logError(error.stack);
      process.exit(1);
    }
  })();
});

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

  const bind = typeof PORT === 'string'
    ? `Pipe ${PORT}`
    : `Port ${PORT}`;

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
