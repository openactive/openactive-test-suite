const express = require('express');
const http = require('http');
const logger = require('morgan');
const { default: axios } = require('axios');
const { criteria, testMatch } = require('@openactive/test-interface-criteria');
const { Handler } = require('htmlmetaparser');
const { Parser } = require('htmlparser2');
const chalk = require('chalk');
const path = require('path');
const { performance } = require('perf_hooks');
const { Base64 } = require('js-base64');
const sleep = require('util').promisify(setTimeout);
const { setupBrowserAutomationRoutes, FatalError } = require('@openactive/openactive-openid-test-client');
const Handlebars = require('handlebars');
const fs = require('fs').promises;
const { Remarkable } = require('remarkable');
const mkdirp = require('mkdirp');
const cliProgress = require('cli-progress');
const { validate } = require('@openactive/data-model-validator');
const { FeedPageChecker } = require('@openactive/rpde-validator');

// Force TTY based on environment variable to ensure TTY output
if (process.env.FORCE_TTY === 'true' && process.env.FORCE_TTY_COLUMNS) {
  process.stdout.isTTY = true;
  process.stderr.isTTY = true;
  process.stdout.columns = parseInt(process.env.FORCE_TTY_COLUMNS, 10);
  process.stderr.columns = parseInt(process.env.FORCE_TTY_COLUMNS, 10);
}

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

const AsyncValidatorWorker = require('./src/validator/async-validator');
const { silentlyAllowInsecureConnections } = require('./src/util/suppress-unauthorized-warning');
const { OpportunityIdCache } = require('./src/util/opportunity-id-cache');
const { logError, logErrorDuringHarvest, log, logCharacter } = require('./src/util/log');
const {
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
  DATASET_DISTRIBUTION_OVERRIDE,
  DO_NOT_FILL_BUCKETS,
  DO_NOT_HARVEST_ORDERS_FEED,
  DISABLE_BROKER_TIMEOUT,
  LOG_AUTH_CONFIG,
  BUTTON_SELECTORS,
  CONSOLE_OUTPUT_LEVEL,
  HEADLESS_AUTH,
  VALIDATOR_TMP_DIR,
} = require('./src/broker-config');
const { getIsOrderUuidPresentApi } = require('./src/order-uuid-tracking/api');
const { createOpportunityListenerApi, getOpportunityListenerApi, createOrderListenerApi, getOrderListenerApi } = require('./src/listeners/api');
const { Listeners } = require('./src/listeners/listeners');
const { state, getTestDataset, getAllDatasets, addFeed } = require('./src/state');
const { orderFeedContextIdentifier } = require('./src/util/feed-context-identifier');
const { withOrdersRpdeHeaders, getOrdersFeedHeader } = require('./src/util/request-utils');
const { OrderUuidTracking } = require('./src/order-uuid-tracking/order-uuid-tracking');

/**
 * @typedef {import('./src/models/core').OrderFeedType} OrderFeedType
 * @typedef {import('./src/models/core').BookingPartnerIdentifier} BookingPartnerIdentifier
 * @typedef {import('./src/models/core').FeedContext} FeedContext
 */

const markdown = new Remarkable();

// Set NODE_TLS_REJECT_UNAUTHORIZED = '0' and suppress associated warning
silentlyAllowInsecureConnections();

const app = express();
app.use(express.json());
setupBrowserAutomationRoutes(app, BUTTON_SELECTORS);

if (REQUEST_LOGGING_ENABLED) {
  app.use(logger('dev'));
}

/**
 * Use OpenActive validator to validate the opportunity
 *
 * @param {any} data opportunity JSON-LD object
 */
async function validateAndStoreValidationResults(data, validator) {
  const id = data['@id'] || data.id;
  const errors = await validator.validateItem(data, ITEM_VALIDATION_MODE);
  if (!errors) return;
  for (const error of errors) {
    // Use the first line of the error message to uniquely identify it
    const errorShortMessage = error.message.split('\n')[0];
    const errorKey = `${error.path}: ${errorShortMessage}`;

    // Ignore the error that a SessionSeries must have children as they haven't been combined yet.
    // This is being done because I don't know if there is a validator.validationMode for this, and without ignoring the broker does not run
    if (data['@type'] === 'SessionSeries' && errorShortMessage === 'A `SessionSeries` must have an `eventSchedule` or at least one `subEvent`.') {
      // eslint-disable-next-line no-continue
      continue;
    }

    // Create a new entry if this is a new error
    let currentValidationResults = state.validationResults.get(errorKey);
    if (!currentValidationResults) {
      currentValidationResults = {
        path: error.path,
        message: errorShortMessage,
        occurrences: 0,
        examples: [],
      };
      state.validationResults.set(errorKey, currentValidationResults);
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
    validationErrors: [...state.validationResults.entries()].map(([errorKey, obj]) => ({
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
  const cachedResponse = state.opportunityMap.get(id) || state.parentOpportunityMap.get(id);
  if (cachedResponse) {
    const jsonString = JSON.stringify(cachedResponse, null, 2);
    return `https://validator.openactive.io/?validationMode=${ITEM_VALIDATION_MODE}#/json/${Base64.encodeURI(jsonString)}`;
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

/**
 * @param {() => Promise<Object.<string, string>>} getHeadersFn
 * @returns {() => Promise<Object.<string, string>>}
 */
function withOpportunityRpdeHeaders(getHeadersFn) {
  return async () => ({
    Accept: 'application/json, application/vnd.openactive.booking+json; version=1',
    'Cache-Control': 'max-age=0',
    ...await getHeadersFn() || {},
  });
}

/**
 * @param {string} baseUrl
 * @param {string} feedContextIdentifier
 * @param {() => Promise<Object.<string, string>>} headers
 * @param {RpdePageProcessor} processPage
 * @param {boolean} isOrdersFeed
 * @param {object} [options]
 * @param {import('cli-progress').MultiBar} [options.bar]
 * @param {boolean} [options.waitForValidation]
 * @param {(feedContextIdentifier: string) => void} [options.processEndOfFeed] Callback which will be called when the feed has
 *   reached its end - when all items have been harvested.
 */
async function harvestRPDE(
  baseUrl,
  feedContextIdentifier,
  headers,
  processPage,
  isOrdersFeed,
  {
    bar,
    waitForValidation,
    processEndOfFeed,
  } = {},
) {
  const onFeedEnd = async () => {
    if (processEndOfFeed) {
      processEndOfFeed(feedContextIdentifier);
    }
    await setFeedIsUpToDate(feedContextIdentifier);
  };
  // Limit validator to 5 minutes if WAIT_FOR_HARVEST is set
  const validatorTimeout = WAIT_FOR_HARVEST ? 1000 * 60 * 5 : null;
  const validator = new AsyncValidatorWorker(feedContextIdentifier, waitForValidation, state.startTime, validatorTimeout);
  state.validatorThreadArray.push(validator);

  let isInitialHarvestComplete = false;
  let numberOfRetries = 0;

  /** @type {FeedContext} */
  const context = {
    currentPage: baseUrl,
    pages: 0,
    items: 0,
    responseTimes: [],
    totalItemsQueuedForValidation: 0,
    validatedItems: 0,
  };
  /**
   * @param {FeedContext} c
   */
  const progressFromContext = (c) => ({
    totalItemsQueuedForValidation: c.totalItemsQueuedForValidation,
    validatedItems: c.validatedItems,
    validatedPercentage: c.totalItemsQueuedForValidation === 0 ? 0 : Math.round((c.validatedItems / c.totalItemsQueuedForValidation) * 100),
    items: c.items,
  });
  const progressbar = !bar ? null : bar.create(0, 0, {
    feedIdentifier: feedContextIdentifier,
    pages: 0,
    responseTime: '-',
    status: 'Harvesting...',
    ...progressFromContext(context),
  });

  if (state.feedContextMap.has(feedContextIdentifier)) {
    throw new Error('Duplicate feed identifier not permitted within dataset distribution.');
  }
  state.feedContextMap.set(feedContextIdentifier, context);
  let url = baseUrl;

  // One instance of FeedPageChecker per feed, as it maintains state relating to the feed
  const feedChecker = new FeedPageChecker();

  // Harvest forever, until a 404 is encountered
  for (;;) {
    // If harvesting is paused, block using the mutex
    await state.pauseResume.waitIfPaused();

    try {
      const options = {
        headers: await headers(),
      };

      const timerStart = performance.now();
      const response = await axios.get(url, options);
      const timerEnd = performance.now();
      const responseTime = timerEnd - timerStart;

      const json = response.data;

      // Validate RPDE page using RPDE Validator, noting that for non-2xx state.pendingGetOpportunityResponses that we want to retry axios will have already thrown an error above
      const rpdeValidationErrors = feedChecker.validateRpdePage({
        url,
        json,
        pageIndex: context.pages,
        contentType: response.headers['content-type'],
        status: response.status,
        isInitialHarvestComplete,
        isOrdersFeed,
      });

      if (rpdeValidationErrors.length > 0) {
        if (state.multibar) state.multibar.stop();
        logError(`\nFATAL ERROR: RPDE Validation Error(s) found on RPDE feed ${feedContextIdentifier} page "${url}":\n${rpdeValidationErrors.map((error) => `- ${error.message.split('\n')[0]}`).join('\n')}\n`);
        process.exit(1);
      }

      context.currentPage = url;
      if (json.next === url && json.items.length === 0) {
        if (!isInitialHarvestComplete) {
          if (progressbar) {
            progressbar.update(context.validatedItems, {
              pages: context.pages,
              responseTime: Math.round(responseTime),
              ...progressFromContext(context),
              status: context.items === 0 ? 'Harvesting Complete (No items to validate)' : 'Harvesting Complete, Validating...',
            });
            progressbar.setTotal(context.totalItemsQueuedForValidation);
          }
          isInitialHarvestComplete = true;
        }
        if (WAIT_FOR_HARVEST || VALIDATE_ONLY) {
          await onFeedEnd();
        } else if (VERBOSE) log(`Sleep mode poll for RPDE feed "${url}"`);
        context.sleepMode = true;
        if (context.timeToHarvestCompletion === undefined) context.timeToHarvestCompletion = millisToMinutesAndSeconds((new Date()).getTime() - state.startTime.getTime());
        // Slow down sleep polling while waiting for harvesting of other feeds to complete
        await sleep(WAIT_FOR_HARVEST && state.incompleteFeeds.length !== 0 ? 5000 : 500);
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
        await processPage(json, feedContextIdentifier, (item) => {
          if (!isInitialHarvestComplete) {
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
        if (!isInitialHarvestComplete && progressbar) {
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
      if ((WAIT_FOR_HARVEST || VALIDATE_ONLY) && isOrdersFeed) {
        onFeedEnd();
      }
      if (error instanceof FatalError) {
        // If a fatal error, quit the application immediately
        if (state.multibar) state.multibar.stop();
        logError(`\nFATAL ERROR for RPDE feed ${feedContextIdentifier} page "${url}": ${error.message}\n`);
        process.exit(1);
      } else if (!error.isAxiosError) {
        // If a non-axios error, quit the application immediately
        if (state.multibar) state.multibar.stop();
        logErrorDuringHarvest(`FATAL ERROR for RPDE feed ${feedContextIdentifier} page "${url}": ${error.message}\n${error.stack}`);
        process.exit(1);
      } else if (error.response?.status === 404) {
        // If 404, simply stop polling feed
        if (WAIT_FOR_HARVEST || VALIDATE_ONLY) { await onFeedEnd(); }
        state.multibar.remove(progressbar);
        state.feedContextMap.delete(feedContextIdentifier);
        if (feedContextIdentifier.indexOf(ORDER_PROPOSALS_FEED_IDENTIFIER) === -1) logErrorDuringHarvest(`Not Found error for RPDE feed ${feedContextIdentifier} page "${url}", feed will be ignored.`);
        return;
      } else {
        logErrorDuringHarvest(`Error ${error?.response?.status ?? 'without response'} for RPDE feed ${feedContextIdentifier} page "${url}" (attempt ${numberOfRetries}): ${error.message}.${error.response ? `\n\nResponse: ${typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : error.response.data}` : ''}`);
        // Force retry, after a delay, up to 12 times
        if (numberOfRetries < 12) {
          numberOfRetries += 1;
          await sleep(5000);
        } else {
          if (state.multibar) state.multibar.stop();
          logError(`\nFATAL ERROR: Retry limit exceeded for RPDE feed ${feedContextIdentifier} page "${url}"\n`);
          process.exit(1);
        }
      }
    }
  }
}

/**
 * @param {object} args
 * @param {string} args.sellerId
 * @param {string} args.bookingFlow
 * @param {string} args.opportunityType
 * @param {string} args.criteriaName
 * @param {string} args.testDatasetIdentifier
 * @returns {any}
 */
function getRandomBookableOpportunity({ sellerId, bookingFlow, opportunityType, criteriaName, testDatasetIdentifier }) {
  const typeBucket = OpportunityIdCache.getTypeBucket(state.opportunityIdCache, {
    criteriaName, bookingFlow, opportunityType,
  });
  const sellerCompartment = typeBucket.contents.get(sellerId);
  if (!sellerCompartment || sellerCompartment.size === 0) {
    const availableSellers = mapToObjectSummary(typeBucket.contents);
    const noCriteriaErrors = bookingFlow === 'OpenBookingApprovalFlow'
      ? "Ensure that some Offers have an 'openBookingFlowRequirement' property that includes the value 'https://openactive.io/OpenBookingApproval'"
      : "Ensure that some Offers have an 'openBookingFlowRequirement' property that DOES NOT include the value 'https://openactive.io/OpenBookingApproval'";
    const criteriaErrors = !typeBucket.criteriaErrors || typeBucket.criteriaErrors?.size === 0 ? noCriteriaErrors : Object.fromEntries(typeBucket.criteriaErrors);
    return {
      suggestion: availableSellers ? 'Try setting sellers.primary.@id in the JSON config to one of the availableSellers below.' : `Check criteriaErrors below for reasons why items in your feed are not matching the criteria '${criteriaName}'.${typeBucket.criteriaErrors.size !== 0 ? ' The number represents the number of items that do not match.' : ''}`,
      availableSellers,
      criteriaErrors: typeBucket.criteriaErrors ? criteriaErrors : undefined,
    };
  } // Seller has no items

  const allTestDatasets = getAllDatasets();
  const unusedBucketItems = Array.from(sellerCompartment).filter((x) => !allTestDatasets.has(x));

  if (unusedBucketItems.length === 0) {
    return {
      suggestion: `No enough items matching criteria '${criteriaName}' were included in your feeds to run all tests. Try adding more test data to your system, or consider using 'Controlled Mode'.`,
    };
  }

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
 * @param {object} args
 * @param {string} args.opportunityType
 * @param {string} args.criteriaName
 * @param {string} args.bookingFlow
 */
function assertOpportunityCriteriaNotFound({ opportunityType, criteriaName, bookingFlow }) {
  const typeBucket = OpportunityIdCache.getTypeBucket(state.opportunityIdCache, {
    criteriaName, opportunityType, bookingFlow,
  });

  // Check that all sellerCompartments are empty
  return Array.from(typeBucket.contents).every(([, items]) => (items.size === 0));
}

function releaseOpportunityLocks(testDatasetIdentifier) {
  const testDataset = getTestDataset(testDatasetIdentifier);
  log(`Cleared dataset '${testDatasetIdentifier}' of opportunity locks ${Array.from(testDataset).join(', ')}`);
  testDataset.clear();
}

function getOpportunityById(opportunityId) {
  const opportunity = state.opportunityMap.get(opportunityId);
  if (!opportunity) {
    return null;
  }
  if (!jsonLdHasReferencedParent(opportunity)) {
    return opportunity;
  }
  const superEvent = state.parentOpportunityMap.get(opportunity.superEvent);
  const facilityUse = state.parentOpportunityMap.get(opportunity.facilityUse);
  if (superEvent || facilityUse) {
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
 * @param {string} feedIdentifier
 */
async function setFeedIsUpToDate(feedIdentifier) {
  if (state.incompleteFeeds.length !== 0) {
    const index = state.incompleteFeeds.indexOf(feedIdentifier);
    if (index > -1) {
      // Remove the feed from the list
      state.incompleteFeeds.splice(index, 1);

      // If all feeds are now completed, trigger responses to healthcheck
      if (state.incompleteFeeds.length === 0) {
        // Stop the validator threads as soon as we've finished harvesting - so only a subset of the results will be validated
        // Note in some circumstances threads will complete their work before terminating
        await Promise.all(state.validatorThreadArray.map(async (validator) => validator.terminate));
        // TODO surely this doesn't work ^ needs to actually call terminate()

        if (state.multibar) state.multibar.stop();

        log('Harvesting is up-to-date');
        const { childOrphans, totalChildren, percentageChildOrphans, totalOpportunities } = getOrphanStats();

        let validationPassed = true;

        if (totalOpportunities === 0) {
          logError(`\n${VALIDATE_ONLY || USE_RANDOM_OPPORTUNITIES ? 'FATAL ERROR' : 'NOTE'}: Zero opportunities could be harvested from the opportunities feeds.`);
          logError('Please ensure that the opportunities feeds conform to RPDE using https://validator.openactive.io/rpde.\n');
          if (VALIDATE_ONLY || USE_RANDOM_OPPORTUNITIES) validationPassed = false;
        } else if (totalChildren !== 0 && childOrphans === totalChildren) {
          logError(`\nFATAL ERROR: 100% of the ${totalChildren} harvested opportunities that reference a parent do not have a matching parent item from the parent feed, so all integration tests will fail.`);
          logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
          await fs.writeFile(`${OUTPUT_PATH}orphans.json`, JSON.stringify(getOrphanJson(), null, 2));
          if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
            logError(`See ${OUTPUT_PATH}orphans.json for more information or visit http://localhost:${PORT}/orphans for more information\n`);
          } else {
            logError(`See ${OUTPUT_PATH}orphans.json for more information\n`);
          }
          validationPassed = false;
        } else if (childOrphans > 0) {
          logError(`\nFATAL ERROR: ${childOrphans} of ${totalChildren} opportunities that reference a parent (${percentageChildOrphans}%) do not have a matching parent item from the parent feed.`);
          logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
          await fs.writeFile(`${OUTPUT_PATH}orphans.json`, JSON.stringify(getOrphanJson(), null, 2));
          if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
            logError(`See ${OUTPUT_PATH}orphans.json for more information or visit http://localhost:${PORT}/orphans for more information\n`);
          } else {
            logError(`See ${OUTPUT_PATH}orphans.json for more information\n`);
          }
          validationPassed = false;
        }

        if (state.validationResults.size > 0) {
          await fs.writeFile(`${OUTPUT_PATH}validation-errors.html`, await renderValidationErrorsHtml());
          const occurrenceCount = [...state.validationResults.values()].reduce((total, result) => total + result.occurrences, 0);
          logError(`\nFATAL ERROR: Validation errors were found in the opportunity data feeds. ${occurrenceCount} errors were reported of which ${state.validationResults.size} were unique.`);
          if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
            logError(`Open ${OUTPUT_PATH}validation-errors.html or http://localhost:${PORT}/validation-errors in your browser for more information\n`);
          } else {
            logError(`See ${OUTPUT_PATH}validation-errors.html for more information\n`);
          }
          validationPassed = false;
        }

        if (validationPassed) {
          if (VALIDATE_ONLY) {
            log(chalk.bold.green('\nFeed validation passed'));
            process.exit(0);
          }
        } else {
          log(chalk.bold.red('\nFeed validation failed\n'));
          if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
            log(chalk.red('(press ctrl+c to close or wait 60 seconds)\n'));
            // Pause harvester and sleep for 1 minute to allow the user to access the /orphans page, before throwing the fatal error
            // User interaction is not required to exit, for compatibility with CI
            await state.pauseResume.pause();
            await sleep(60000);
          }
          process.exit(1);
        }

        unlockHealthCheck();
      }
    }
  }
}

function unlockHealthCheck() {
  state.healthCheckResponsesWaitingForHarvest.forEach((res) => res.send('openactive-broker'));
  // Clear response array
  state.healthCheckResponsesWaitingForHarvest.splice(0, state.healthCheckResponsesWaitingForHarvest.length);
  // Clear state.incompleteFeeds array
  state.incompleteFeeds.splice(0, state.incompleteFeeds.length);
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

app.get('/health-check', async function (req, res) {
  // Healthcheck response will block until all feeds are up-to-date, which is useful in CI environments
  // to ensure that the tests will not run until the feeds have been fully consumed
  // Allow blocking for up to 10 minutes to fully harvest the feed
  const wasPaused = state.pauseResume.resume();
  if (wasPaused) log('Harvesting resumed');
  req.setTimeout(1000 * 60 * 10);
  if (WAIT_FOR_HARVEST && state.incompleteFeeds.length !== 0) {
    state.healthCheckResponsesWaitingForHarvest.push(res);
  } else {
    res.send('openactive-broker');
  }
});

app.post('/pause', async function (req, res) {
  await state.pauseResume.pause();
  log('Harvesting paused');
  res.send();
});

function getConfig() {
  return {
    // Allow a consistent startDate to be used when calling test-interface-criteria
    harvestStartTime: HARVEST_START_TIME,
    // Base URL used by the integration tests
    bookingApiBaseUrl: state.datasetSiteJson.accessService?.endpointURL,
    // Base URL used by the authentication tests
    authenticationAuthority: state.datasetSiteJson.accessService?.authenticationAuthority,
    ...state.globalAuthKeyManager.config,
    headlessAuth: HEADLESS_AUTH,
  };
}

// Config endpoint used to get global variables within the integration tests
app.get('/config', async function (req, res) {
  await state.globalAuthKeyManager.refreshAuthorizationCodeFlowAccessTokensIfNeeded();
  res.json(getConfig());
});

app.get('/dataset-site', function (req, res) {
  res.json(state.datasetSiteJson);
});

/**
 * @param {Map | Set} map
 * @returns {{[k: string]: any} | number}
 */
function mapToObjectSummary(map) {
  if (map instanceof Map) {
    // Return a object representation of a Map
    const obj = Object.assign(Object.create(null), ...[...map].map((v) => (typeof v[1] === 'object' && v[1].size === 0
      ? {}
      : {
        [v[0]]: mapToObjectSummary(v[1]),
      })));
    if (JSON.stringify(obj) === JSON.stringify({})) {
      return undefined;
    }
    return obj;
  } if (map instanceof Set) {
    // Return just the size of a Set, to render at the leaf nodes of the resulting tree,
    // instead of outputting the whole set contents. This reduces the size of the output for display.
    return map.size;
  }
  // @ts-ignore
  if (map.contents) {
    // @ts-ignore
    const result = mapToObjectSummary(map.contents);
    if (result && Object.keys(result).length > 0) {
      // @ts-ignore
      return result;
    }
    // @ts-ignore
    if (map.criteriaErrors && map.criteriaErrors.size > 0) {
      return {
        // @ts-ignore
        criteriaErrors: Object.fromEntries(map.criteriaErrors),
      };
    }
    return undefined;
  }
  return map;
}

function millisToMinutesAndSeconds(millis) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds.toFixed(0)}`;
}

function getOrphanJson() {
  const rows = Array.from(state.rowStoreMap.values()).filter((x) => x.jsonLdParentId !== null);
  return {
    children: {
      matched: rows.filter((x) => !x.waitingForParentToBeIngested).length,
      orphaned: rows.filter((x) => x.waitingForParentToBeIngested).length,
      total: rows.length,
      orphanedList: rows.filter((x) => x.waitingForParentToBeIngested).slice(0, 1000).map((({ jsonLdType, id, modified, jsonLd, jsonLdId, jsonLdParentId }) => ({
        jsonLdType,
        id,
        modified,
        jsonLd,
        jsonLdId,
        jsonLdParentId,
      }))),
    },
  };
}

app.get('/orphans', function (req, res) {
  res.send(getOrphanJson());
});

/**
 * @typedef {Object} OrphanStats
 * @property {number} childOrphans
 * @property {number} totalChildren
 * @property {string} percentageChildOrphans
 * @property {number} totalOpportunities
 */

/**
 * @returns {OrphanStats}
 */
function getOrphanStats() {
  const childRows = Array.from(state.rowStoreMap.values()).filter((x) => x.jsonLdParentId !== null);
  const childOrphans = childRows.filter((x) => x.waitingForParentToBeIngested).length;
  const totalChildren = childRows.length;
  const totalOpportunities = Array.from(state.rowStoreMap.values()).filter((x) => !x.waitingForParentToBeIngested).length;
  const percentageChildOrphans = totalChildren > 0 ? ((childOrphans / totalChildren) * 100).toFixed(2) : '0';
  return {
    childOrphans,
    totalChildren,
    percentageChildOrphans,
    totalOpportunities,
  };
}

app.get('/status', function (req, res) {
  const { childOrphans, totalChildren, percentageChildOrphans, totalOpportunities } = getOrphanStats();
  res.send({
    elapsedTime: millisToMinutesAndSeconds((new Date()).getTime() - state.startTime.getTime()),
    harvestingStatus: state.pauseResume.pauseHarvestingStatus,
    feeds: mapToObjectSummary(state.feedContextMap),
    orphans: {
      children: `${childOrphans} of ${totalChildren} (${percentageChildOrphans}%)`,
    },
    totalOpportunitiesHarvested: totalOpportunities,
    buckets: DO_NOT_FILL_BUCKETS ? null : mapToObjectSummary(state.opportunityIdCache),
  });
});

app.get('/validation-errors', async function (req, res) {
  res.send(await renderValidationErrorsHtml());
});

app.delete('/opportunity-cache', function (req, res) {
  state.parentOpportunityMap.clear();
  state.parentOpportunityRpdeMap.clear();
  state.opportunityMap.clear();
  state.opportunityRpdeMap.clear();
  state.rowStoreMap.clear();
  state.parentIdIndex.clear();

  state.opportunityIdCache = OpportunityIdCache.create();

  res.status(204).send();
});

app.get('/opportunity-cache/:id', function (req, res) {
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityById(id);

    if (cachedResponse) {
      if (CONSOLE_OUTPUT_LEVEL === 'dot') {
        logCharacter('.');
      } else {
        log(`Used cache for "${id}"`);
      }
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

/**
 * For an Opportunity being harvested from RPDE, check if there is a listener listening for it.
 *
 * If so, respond to that listener.
 *
 * @param {string} id
 * @param {any} item
 */
function doNotifyOpportunityListener(id, item) {
  Listeners.doNotifyListener(state.listeners.byOpportunityId, id, item);
}

/**
 * For an Order being harvested from RPDE, check if there is a listener listening for it.
 *
 * If so, respond to that listener.
 *
 * @param {OrderFeedType} type
 * @param {string} bookingPartnerIdentifier
 * @param {string} uuid
 * @param {any} item
 */
function doNotifyOrderListener(type, bookingPartnerIdentifier, uuid, item) {
  const listenerId = Listeners.getOrderListenerId(type, bookingPartnerIdentifier, uuid);
  Listeners.doNotifyListener(state.listeners.byOrderUuid, listenerId, item);
}

app.post('/opportunity-listeners/:id', createOpportunityListenerApi);
app.get('/opportunity-listeners/:id', getOpportunityListenerApi);
app.post('/order-listeners/:type/:bookingPartnerIdentifier/:uuid', createOrderListenerApi);
app.get('/order-listeners/:type/:bookingPartnerIdentifier/:uuid', getOrderListenerApi);

app.get('/is-order-uuid-present/:type/:bookingPartnerIdentifier/:uuid', getIsOrderUuidPresentApi);

app.get('/opportunity/:id', function (req, res) {
  const useCacheIfAvailable = req.query.useCacheIfAvailable === 'true';

  // respond with json
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityById(id);

    if (useCacheIfAvailable && cachedResponse) {
      if (CONSOLE_OUTPUT_LEVEL === 'dot') {
        logCharacter('.');
      } else {
        log(`used cached response for "${id}"`);
      }
      res.json({
        data: cachedResponse,
      });
    } else {
      if (CONSOLE_OUTPUT_LEVEL === 'dot') {
        logCharacter('.');
      } else {
        log(`listening for "${id}"`);
      }

      // Stash the response and reply later when an event comes through (kill any existing id still waiting)
      if (state.pendingGetOpportunityResponses[id] && state.pendingGetOpportunityResponses[id] !== null) state.pendingGetOpportunityResponses[id].cancel();
      state.pendingGetOpportunityResponses[id] = {
        send(json) {
          state.pendingGetOpportunityResponses[id] = null;
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
    || opportunity.superEvent?.organizer
    || opportunity.superEvent?.superEvent?.organizer
    || opportunity?.facilityUse.provider;

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
        case undefined:
          return 'Event';
        default:
          throw new Error('Event has unrecognised @type of superEvent');
      }
    default:
      throw new Error('Only bookable opportunities are permitted in the test interface');
  }
}

/**
 * @param {{[k: string]: any}} opportunity
 * @returns {string[]} An opportunity can support multiple Booking Flows as these are in the Offers. An Opportunity
 *   can have an Offer requiring approval and one that does not.
 */
function detectOpportunityBookingFlows(opportunity) {
  const offers = opportunity.offers || (opportunity.superEvent || opportunity.facilityUse)?.offers;
  if (!offers) {
    throw new Error(`Opportunity (ID: ${opportunity['@id']}) has no offers in superEvent/facilityUse`);
  }
  /** @type {Set<string>} */
  const bookingFlows = new Set();
  for (const offer of offers) {
    if (offer.openBookingFlowRequirement && offer.openBookingFlowRequirement.includes('https://openactive.io/OpenBookingApproval')) {
      bookingFlows.add('OpenBookingApprovalFlow');
    } else {
      bookingFlows.add('OpenBookingSimpleFlow');
    }
  }
  return [...bookingFlows];
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
  // converts e.g. https://openactive.io/test-interface#OpenBookingApproval -> OpenBookingApproval.
  const bookingFlow = opportunity['test:testOpenBookingFlow'].replace('https://openactive.io/test-interface#', '');

  const result = getRandomBookableOpportunity({
    sellerId, bookingFlow, opportunityType, criteriaName, testDatasetIdentifier,
  });
  if (result && result.opportunity) {
    if (CONSOLE_OUTPUT_LEVEL === 'dot') {
      logCharacter('.');
    } else {
      log(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} within ${bookingFlow} (${result.opportunity['@type']}): ${result.opportunity['@id']}`);
    }
    res.json(result.opportunity);
  } else {
    logError(`Random Bookable Opportunity from seller ${sellerId} for ${criteriaName} within ${bookingFlow} (${opportunityType}) call failed: No matching opportunities found`);
    res.status(404).json({
      error: `Opportunity Type '${opportunityType}' not found for seller '${sellerId}' matching '${criteriaName}' within '${bookingFlow}'.`,
      ...result,
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
  // converts e.g. https://openactive.io/test-interface#OpenBookingApproval -> OpenBookingApproval.
  const bookingFlow = opportunity['test:testOpenBookingFlow'].replace('https://openactive.io/test-interface#', '');

  const result = assertOpportunityCriteriaNotFound({
    opportunityType, criteriaName, bookingFlow,
  });

  if (result) {
    if (CONSOLE_OUTPUT_LEVEL === 'dot') {
      logCharacter('.');
    } else {
      log(`Asserted that no opportunities match ${criteriaName} (${opportunityType}).`);
    }
    res.status(204).send();
  } else {
    if (CONSOLE_OUTPUT_LEVEL === 'dot') {
      logCharacter('.');
    } else {
      log(`Call failed for "/assert-unmatched-criteria" for ${criteriaName} (${opportunityType}): Matching opportunities found.`);
    }
    res.status(404).json({
      error: `Assertion not available: opportunities exist that match '${criteriaName}' for Opportunity Type '${opportunityType}'.`,
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
      const jsonLdId = state.parentOpportunityRpdeMap.get(feedItemIdentifier);
      state.parentOpportunityMap.delete(jsonLdId);
      state.parentOpportunityRpdeMap.delete(feedItemIdentifier);
    } else {
      // Run any validation logic for this item
      await validateItemFn(item.data);

      const jsonLdId = item.data['@id'] || item.data.id;
      state.parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.parentOpportunityMap.set(jsonLdId, item.data);
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
      const jsonLdId = state.opportunityRpdeMap.get(feedItemIdentifier);
      state.opportunityMap.delete(jsonLdId);
      state.opportunityRpdeMap.delete(feedItemIdentifier);

      deleteOpportunityItem(jsonLdId);
    } else {
      // Run any validation logic for this item
      await validateItemFn(item.data);

      const jsonLdId = item.data['@id'] || item.data.id;
      state.opportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.opportunityMap.set(jsonLdId, item.data);

      await storeOpportunityItem(item);
    }
  }
}

async function touchOpportunityItems(parentIds) {
  const opportunitiesToUpdate = new Set();

  parentIds.forEach((parentId) => {
    if (state.parentIdIndex.has(parentId)) {
      state.parentIdIndex.get(parentId).forEach((jsonLdId) => {
        opportunitiesToUpdate.add(jsonLdId);
      });
    }
  });

  await Promise.all([...opportunitiesToUpdate].map(async (jsonLdId) => {
    if (state.rowStoreMap.has(jsonLdId)) {
      const row = state.rowStoreMap.get(jsonLdId);
      row.feedModified = Date.now() + 1000; // 1 second in the future
      row.waitingForParentToBeIngested = false;
      await processRow(row);
    }
  }));
}

function deleteOpportunityItem(jsonLdId) {
  const row = state.rowStoreMap.get(jsonLdId);
  if (row) {
    const idx = state.parentIdIndex.get(row.jsonLdParentId);
    if (idx) {
      idx.delete(jsonLdId);
    }
    state.rowStoreMap.delete(jsonLdId);
  }
}

async function storeOpportunityItem(item) {
  if (item.state === 'deleted') throw new Error('Not expected to be called for deleted items');

  const row = {
    id: item.id,
    modified: item.modified,
    deleted: false,
    feedModified: Date.now() + 1000, // 1 second in the future,
    jsonLdId: item.data['@id'] || item.data.id || null,
    jsonLd: item.data,
    jsonLdType: item.data['@type'] || item.data.type,
    jsonLdParentId: !jsonLdHasReferencedParent(item.data) ? null : item.data.superEvent || item.data.facilityUse,
    waitingForParentToBeIngested: jsonLdHasReferencedParent(item.data) && !(state.parentOpportunityMap.has(item.data.superEvent) || state.parentOpportunityMap.has(item.data.facilityUse)),
  };

  if (row.jsonLdId != null) {
    if (row.jsonLdParentId != null) {
      if (!state.parentIdIndex.has(row.jsonLdParentId)) state.parentIdIndex.set(row.jsonLdParentId, new Set());
      state.parentIdIndex.get(row.jsonLdParentId).add(row.jsonLdId);
    }

    state.rowStoreMap.set(row.jsonLdId, row);

    if (!row.waitingForParentToBeIngested) {
      await processRow(row);
    }
  } else {
    throw new FatalError(`RPDE item '${item.id}' of kind '${item.kind}' does not have an @id. All items in the feeds must have an @id within the "data" property.`);
  }
}

function jsonLdHasReferencedParent(data) {
  return typeof data?.superEvent === 'string' || typeof data?.facilityUse === 'string';
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
  let newItem;
  // No need for processing for items without parents
  if (row.jsonLdParentId === null) {
    newItem = {
      state: row.deleted ? 'deleted' : 'updated',
      id: row.jsonLdId,
      modified: row.feedModified,
      data: row.jsonLd,
    };
  } else {
    const parentOpportunity = state.parentOpportunityMap.get(row.jsonLdParentId);
    const mergedContexts = getMergedJsonLdContext(row.jsonLd, parentOpportunity);

    const parentOpportunityWithoutContext = {
      ...parentOpportunity,
    };
    delete parentOpportunityWithoutContext['@context'];

    const rowJsonLdWithoutContext = {
      ...row.jsonLd,
    };
    delete rowJsonLdWithoutContext['@context'];

    newItem = {
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
      const bookingFlows = detectOpportunityBookingFlows(item.data);
      const sellerId = detectSellerId(item.data);

      for (const { criteriaName, criteriaResult } of criteria.map((c) => ({
        criteriaName: c.name,
        criteriaResult: testMatch(c, item.data, {
          harvestStartTime: HARVEST_START_TIME,
        }),
      }))) {
        for (const bookingFlow of bookingFlows) {
          const typeBucket = OpportunityIdCache.getTypeBucket(state.opportunityIdCache, {
            criteriaName, opportunityType, bookingFlow,
          });
          if (!typeBucket.contents.has(sellerId)) typeBucket.contents.set(sellerId, new Set());
          const sellerCompartment = typeBucket.contents.get(sellerId);
          if (criteriaResult.matchesCriteria) {
            sellerCompartment.add(id);
            matchingCriteria.push(criteriaName);
            // Hide criteriaErrors if at least one matching item is found
            typeBucket.criteriaErrors = undefined;
          } else {
            sellerCompartment.delete(id);
            unmetCriteriaDetails = unmetCriteriaDetails.concat(criteriaResult.unmetCriteriaDetails);
            // Ignore errors if criteriaErrors is already hidden
            if (typeBucket.criteriaErrors) {
              for (const error of criteriaResult.unmetCriteriaDetails) {
                if (!typeBucket.criteriaErrors.has(error)) typeBucket.criteriaErrors.set(error, 0);
                typeBucket.criteriaErrors.set(error, typeBucket.criteriaErrors.get(error) + 1);
              }
            }
          }
        }
      }
    }

    if (state.pendingGetOpportunityResponses[id]) {
      state.pendingGetOpportunityResponses[id].send(item);
    }

    if (VERBOSE) {
      const bookableIssueList = unmetCriteriaDetails.length > 0
        ? `\n   [Unmet Criteria: ${Array.from(new Set(unmetCriteriaDetails)).join(', ')}]` : '';
      if (state.pendingGetOpportunityResponses[id]) {
        log(`seen ${matchingCriteria.join(', ')} and dispatched ${id}${bookableIssueList}`);
      } else {
        log(`saw ${matchingCriteria.join(', ')} ${id}${bookableIssueList}`);
      }
    }

    doNotifyOpportunityListener(id, item);
  }
}

/**
 * @param {OrderFeedType} orderFeedType
 * @param {string} bookingPartnerIdentifier
 * @returns {RpdePageProcessor}
 */
function monitorOrdersPage(orderFeedType, bookingPartnerIdentifier) {
  return (rpdePage) => {
    for (const item of rpdePage.items) {
      if (item.id) {
        OrderUuidTracking.doTrackOrderUuidAndUpdateListeners(
          state.orderUuidTracking,
          orderFeedType,
          bookingPartnerIdentifier,
          item.id,
        );
        doNotifyOrderListener(orderFeedType, bookingPartnerIdentifier, item.id, item);
      }
    }
  };
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

  if (!dataset) {
    logError(`
Error: Unable to read valid JSON-LD from Dataset Site. Please try loading the
Dataset Site URL in validator.openactive.io to confirm that the content of
<script type="application/ld+json"> ... </script> within the HTML is valid.
`);

    throw new Error('Unable to read valid JSON-LD from Dataset Site.');
  }

  // Validate dataset site JSON-LD
  const datasetSiteErrors = (await validate(dataset, {
    loadRemoteJson: true,
    remoteJsonCachePath: VALIDATOR_TMP_DIR,
    remoteJsonCacheTimeToLive: 3600,
    validationMode: 'DatasetSite',
  }))
    .filter((result) => result.severity === 'failure')
    .map((error) => `${error.path}: ${error.message.split('\n')[0]}`);

  if (datasetSiteErrors.length > 0) {
    logError(`
Error: Dataset Site JSON-LD contained validation errors. Please try loading the
Dataset Site URL in validator.openactive.io to confirm that the content of
<script type="application/ld+json"> ... </script> within the HTML is valid.

Validation errors found in Dataset Site JSON-LD:
- ${datasetSiteErrors.join('\n- ')}

`);

    throw new Error('Unable to read valid JSON-LD from Dataset Site.');
  }

  // Set global based on data result
  state.datasetSiteJson = dataset;

  if (!VALIDATE_ONLY) {
    if (dataset.accessService?.authenticationAuthority) {
      try {
        await state.globalAuthKeyManager.initialise(dataset.accessService.authenticationAuthority, HEADLESS_AUTH);
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
  }

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
  state.multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: false,
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
      harvesters.push(
        harvestRPDE(
          dataDownload.contentUrl,
          feedIdentifier,
          withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
          ingestParentOpportunityPage,
          false,
          {
            bar: state.multibar,
            waitForValidation: true,
          },
        ),
      );
    } else if (isParentFeed[dataDownload.additionalType] === false) {
      log(`Found opportunity feed: ${dataDownload.contentUrl}`);
      addFeed(feedIdentifier);
      harvesters.push(
        harvestRPDE(
          dataDownload.contentUrl,
          feedIdentifier,
          withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
          ingestOpportunityPage,
          false,
          {
            bar: state.multibar,
            waitForValidation: false,
          },
        ),
      );
    } else {
      logError(`\nERROR: Found unsupported feed in dataset site "${dataDownload.contentUrl}" with additionalType "${dataDownload.additionalType}"`);
      logError(`Only the following additionalType values are supported: \n${Object.keys(isParentFeed).map((x) => `- "${x}"`).join('\n')}'`);
    }
  });

  /**
   *  @type {BookingPartnerIdentifier[]}
   */
  const bookingPartnerIdentifiers = ['primary', 'secondary'];

  // Only poll orders feed if included in the dataset site
  if (!VALIDATE_ONLY && !DO_NOT_HARVEST_ORDERS_FEED && dataset.accessService && dataset.accessService.endpointURL) {
    for (const { feedUrl, type, feedContextIdentifier, bookingPartnerIdentifier: feedBookingPartnerIdentifier } of bookingPartnerIdentifiers.flatMap((bookingPartnerIdentifier) => [
      {
        feedUrl: `${dataset.accessService.endpointURL}/orders-rpde`,
        type: /** @type {OrderFeedType} */('orders'),
        feedContextIdentifier: orderFeedContextIdentifier(ORDERS_FEED_IDENTIFIER, bookingPartnerIdentifier),
        bookingPartnerIdentifier,
      },
      {
        feedUrl: `${dataset.accessService.endpointURL}/order-proposals-rpde`,
        type: /** @type {OrderFeedType} */('order-proposals'),
        feedContextIdentifier: orderFeedContextIdentifier(ORDER_PROPOSALS_FEED_IDENTIFIER, bookingPartnerIdentifier),
        bookingPartnerIdentifier,
      },
    ])) {
      log(`Found ${type} feed: ${feedUrl}`);
      addFeed(feedContextIdentifier);
      harvesters.push(harvestRPDE(
        feedUrl,
        feedContextIdentifier,
        withOrdersRpdeHeaders(getOrdersFeedHeader(feedBookingPartnerIdentifier)),
        feedBookingPartnerIdentifier === 'primary'
          ? monitorOrdersPage(type, feedBookingPartnerIdentifier)
          : () => null,
        true,
        {
          bar: state.multibar,
          processEndOfFeed: () => {
            OrderUuidTracking.doTrackEndOfFeed(state.orderUuidTracking, type, feedBookingPartnerIdentifier);
          },
        },
      ));
    }
  }

  // Finished processing dataset site
  if (WAIT_FOR_HARVEST) log('\nBlocking integration tests to wait for harvest completion...');
  await setFeedIsUpToDate('DatasetSite');

  // Wait until all harvesters error catastrophically before existing
  await Promise.all(harvesters);
}

// Ensure that dataset site request also delays "readiness"
addFeed('DatasetSite');

const server = http.createServer(app);
server.on('error', onError);

app.listen(PORT, () => {
  log(`Broker Microservice running on port ${PORT}

Check ${MICROSERVICE_BASE_URL}/status for current harvesting status
`);
  // if this has been run as a child process in the `npm start` script, `process.send` will be defined.
  if (process.send) {
    // Notify parent process that the server is up
    process.send('listening');
  }

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

// Ensure bucket allocation does not become stale
setTimeout(() => {
  logError('\n------ WARNING: openactive-broker-microservice has been running for too long ------\n\nOpportunities are sorted into test-interface-criteria buckets based on the startDate of the opportunity when it is harvested. The means that the broker microservice must be restarted periodically to ensure its buckets allocation does not get stale. If bucket allocation becomes stale, tests will start to fail randomly.\n');
  if (!DISABLE_BROKER_TIMEOUT && !DO_NOT_FILL_BUCKETS) {
    const message = 'BROKER TIMEOUT: The openactive-broker-microservice has been running for too long and its bucket allocation is at risk of becoming stale. It must be restarted to continue.';
    logError(`${message}\n`);
    throw new Error(message);
  }
}, 3600000); // 3600000 ms = 1 hour

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
