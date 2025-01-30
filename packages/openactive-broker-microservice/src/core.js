const sleep = require('util').promisify(setTimeout);
const fs = require('fs').promises;
const { criteria, testMatch, utils: criteriaUtils } = require('@openactive/test-interface-criteria');
const chalk = require('chalk');
const { Base64 } = require('js-base64');
const { FatalError } = require('@openactive/openactive-openid-client');
const Handlebars = require('handlebars');
const { Remarkable } = require('remarkable');
const mkdirp = require('mkdirp');
const cliProgress = require('cli-progress');
const { validate } = require('@openactive/data-model-validator');
const { expect } = require('chai');
const { isNil, partialRight } = require('lodash');
const { harvestRPDELossless } = require('@openactive/harvesting-utils');
const { partial } = require('lodash');
const path = require('path');
const nodeCleanup = require('node-cleanup');

const { CriteriaOrientedOpportunityIdCache } = require('./util/criteria-oriented-opportunity-id-cache');
const { logError, logErrorDuringHarvest, log, logCharacter } = require('./util/log');
const {
  PORT,
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
  DO_NOT_FILL_BUCKETS,
  DO_NOT_HARVEST_ORDERS_FEED,
  LOG_AUTH_CONFIG,
  CONSOLE_OUTPUT_LEVEL,
  HEADLESS_AUTH,
  VALIDATOR_TMP_DIR,
  BOOKING_PARTNER_IDENTIFIERS,
} = require('./broker-config');
const { TwoPhaseListeners } = require('./twoPhaseListeners/twoPhaseListeners');
const { state, setGlobalValidatorWorkerPool, getGlobalValidatorWorkerPool } = require('./state');
const { orderFeedContextIdentifier, createBrokerFeedContext, getMultibarProgressFromContext } = require('./util/feed-context');
const { withOrdersRpdeHeaders, getOrdersFeedHeader } = require('./util/request-utils');
const { OrderUuidTracking } = require('./order-uuid-tracking/order-uuid-tracking');
const { error400IfExpressParamsAreMissing } = require('./util/api-utils');
const { ValidatorWorkerPool } = require('./validator/validator-worker-pool');
const { setUpValidatorInputs, cleanUpValidatorInputs, createAndSaveValidatorInputsFromRpdePage } = require('./validator/validator-inputs');
const { invertFacilityUseItem: invertFacilityUseItemIfPossible, createItemFromSubEvent } = require('./util/item-transforms');
const { extractJSONLDfromDatasetSiteUrl } = require('./util/extract-jsonld-utils');
const { getOrphanStats, getStatus, millisToMinutesAndSeconds } = require('./util/get-status');
const { getOrphanJson } = require('./util/get-orphans');
const { getOpportunityMergedWithParentById } = require('./util/get-opportunity-by-id-from-cache');
const { getMergedJsonLdContext } = require('./util/jsonld-utils');
const { jsonLdHasReferencedParent } = require('./util/jsonld-utils');
const { getRandomBookableOpportunity } = require('./util/get-random-bookable-opportunity');
const { getLockedOpportunityIdsInTestDataset } = require('./util/state-utils');
const { detectOpportunityType } = require('./util/opportunity-utils');
const { detectSellerId } = require('./util/opportunity-utils');
const { getSampleOpportunities } = require('./util/sample-opportunities');

/**
 * @typedef {import('./models/core').OrderFeedType} OrderFeedType
 * @typedef {import('./models/core').BookingPartnerIdentifier} BookingPartnerIdentifier
 */

const markdown = new Remarkable();

// This is run when the process exits
nodeCleanup(function () {
  if (state.multibar !== null) {
    // Restores terminal cursor settings before exiting
    state.multibar.stop();
  }
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function homepageRoute(req, res) {
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
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function healthCheckRoute(req, res) {
  // Healthcheck response will block until all feeds are up-to-date, which is useful in CI environments
  // to ensure that the tests will not run until the feeds have been fully consumed
  // Allow blocking for up to 10 minutes to fully harvest the feed
  const wasPaused = state.pauseResume.resume();
  if (wasPaused) log('Harvesting resumed');
  req.setTimeout(1000 * 60 * 10);
  if (WAIT_FOR_HARVEST && state.incompleteFeeds.anyFeedsStillHarvesting()) {
    state.healthCheckResponsesWaitingForHarvest.push(res);
  } else {
    res.send('openactive-broker');
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function pauseRoute(req, res) {
  await state.pauseResume.pause();
  log('Harvesting paused');
  res.send();
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getConfigRoute(req, res) {
  await state.globalAuthKeyManager.refreshAuthorizationCodeFlowAccessTokensIfNeeded();
  res.json(getConfig());
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getDatasetSiteRoute(req, res) {
  res.json(state.datasetSiteJson);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getOrphansRoute(req, res) {
  res.send(getOrphanJson(state));
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getStatusRoute(req, res) {
  res.send(getStatus({
    DO_NOT_FILL_BUCKETS,
  }, state));
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getValidationErrorsRoute(req, res) {
  res.send(await renderValidationErrorsHtml(getGlobalValidatorWorkerPool()));
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function deleteOpportunityCacheRoute(req, res) {
  state.opportunityCache.parentMap.clear();
  state.opportunityHousekeepingCaches.parentOpportunityRpdeMap.clear();
  state.opportunityCache.childMap.clear();
  state.opportunityHousekeepingCaches.opportunityRpdeMap.clear();
  state.opportunityItemRowCache.store.clear();
  state.opportunityItemRowCache.parentIdIndex.clear();

  state.criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

  res.status(204).send();
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getOpportunityCacheByIdRoute(req, res) {
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityMergedWithParentById(state, id);

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
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getOpportunityByIdRoute(req, res) {
  if (!error400IfExpressParamsAreMissing(req, res, ['id'])) { return; }
  const { id } = req.params;

  const useCacheIfAvailable = req.query.useCacheIfAvailable === 'true';
  /* Use ?expectedCapacity=2 for the Opportunity to appear with this capacity. If it is found with a different
  capacity, this route will wait until it times out or the Opportunity is updated again with the expected
  capacity. */
  const expectedCapacity = (() => {
    if ('expectedCapacity' in req.query) {
      const asNum = Number(req.query.expectedCapacity);
      // eslint-disable-next-line no-unused-expressions
      expect(asNum).to.not.be.NaN;
      return asNum;
    }
    return null;
  })();

  const doesItemMatchCriteria = isNil(expectedCapacity)
    ? (() => true)
    : ((rpdeItem) => (
      criteriaUtils.getRemainingCapacity(rpdeItem.data) === expectedCapacity
    ));
  // If it's not in the cache already, the route will return if/when it is found
  doOnePhaseListenForOpportunity(id, useCacheIfAvailable, doesItemMatchCriteria, res);
}

/**
 * A stand-in for the Test Interface Create Opportunity route, which instead
 * gets a random opportunity from a Booking System which does not support
 * Controlled Mode.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getRandomOpportunityRoute(req, res) {
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

  const result = getRandomBookableOpportunity(state, {
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
      error: `Opportunity of type '${opportunityType}' that has an \`organizer\`/\`provider\` with \`@id\` '${sellerId}', that also matched '${criteriaName}' within '${bookingFlow}', was not found within the feeds.`,
      type: 'OpportunityNotFound',
      ...result,
    });
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function deleteTestDatasetRoute(req, res) {
  // Use :testDatasetIdentifier to identify locks, and clear them
  const { testDatasetIdentifier } = req.params;
  releaseOpportunityLocks(testDatasetIdentifier);
  res.status(204).send();
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function assertUnmatchedCriteriaRoute(req, res) {
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
      error: `Opportunities exist in the feeds that match '${criteriaName}' for Opportunity Type '${opportunityType}'. The current configuration of the test suite asserts that such opportunities should not exist. One of the \`implementedFeatures\` in the test suite configuration is likely set to \`false\` when it should be set to \`true\`.`,
    });
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getSampleOpportunitiesRoute(req, res) {
  res.json(getSampleOpportunities({
    HARVEST_START_TIME,
  }, state, req.body));
}

/**
 * Render the currently stored validation errors as HTML
 *
 * @param {ValidatorWorkerPool} validatorWorkerPool
 */
async function renderValidationErrorsHtml(validatorWorkerPool) {
  return renderTemplate('validation-errors', {
    validationErrors: [...validatorWorkerPool.getValidationResults().entries()].map(([errorKey, obj]) => ({
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
  const cachedResponse = state.opportunityCache.childMap.get(id) || state.opportunityCache.parentMap.get(id);
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
    const file = await fs.readFile(`${path.join(__dirname, '..')}/templates/${name}.handlebars`, 'utf8');
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
 * @param {object} args
 * @param {string} args.opportunityType
 * @param {string} args.criteriaName
 * @param {string} args.bookingFlow
 */
function assertOpportunityCriteriaNotFound({ opportunityType, criteriaName, bookingFlow }) {
  const typeBucket = CriteriaOrientedOpportunityIdCache.getTypeBucket(state.criteriaOrientedOpportunityIdCache, {
    criteriaName, opportunityType, bookingFlow,
  });

  // Check that all sellerCompartments are empty
  return Array.from(typeBucket.contents).every(([, items]) => (items.size === 0));
}

/**
 * @param {string} testDatasetIdentifier
 */
function releaseOpportunityLocks(testDatasetIdentifier) {
  const testDataset = getLockedOpportunityIdsInTestDataset(state, testDatasetIdentifier);
  log(`Cleared dataset '${testDatasetIdentifier}' of opportunity locks ${Array.from(testDataset).join(', ')}`);
  testDataset.clear();
}

/**
 * Call this function on a feed when the last page has been fetched, indicating
 * that we have, as of the time of the last page fetch, read and cached all
 * data from the feed.
 *
 * It marks the feed as complete, and if all feeds are complete, it triggers
 * some housekeeping.
 *
 * @param {ValidatorWorkerPool} validatorWorkerPool
 * @param {string} feedIdentifier
 * @param {object} [options]
 * @param {import('cli-progress').MultiBar} [options.multibar]
 */
async function setFeedIsUpToDate(validatorWorkerPool, feedIdentifier, { multibar } = {}) {
  if (!state.incompleteFeeds.markFeedHarvestComplete(feedIdentifier)) {
    return;
  }
  if (state.incompleteFeeds.anyFeedsStillHarvesting()) {
    return;
  }
  // All feeds are now completed
  // Finish and cleanup any ongoing validation work
  /* Signal for the Validator Worker Pool that we may stop once the validator timeout has run.
  Validator is an expensive process and is not completely necessary for Booking API testing. So we put a hard
  limit on how long it runs for (once all items are harvested).
  This means that, in some cases, only a subset of the results will be validated.
  Note that the worker pool will finish its current iteration if it has already reached the timeout. */
  await validatorWorkerPool.stopWhenTimedOut();
  await cleanUpValidatorInputs();

  // Stop showing progress bar
  if (multibar) multibar.stop();

  log('Harvesting is up-to-date');

  // Run some assertions to ensure that feed harvesting has lead to the correct state.
  const { childOrphans, totalChildren, percentageChildOrphans, totalOpportunities } = getOrphanStats(state);

  let validationPassed = true;

  if (totalOpportunities === 0) {
    logError(`\n${VALIDATE_ONLY || USE_RANDOM_OPPORTUNITIES ? 'FATAL ERROR' : 'NOTE'}: Zero opportunities could be harvested from the opportunities feeds.`);
    logError('Please ensure that the opportunities feeds conform to RPDE using https://validator.openactive.io/rpde.\n');
    if (VALIDATE_ONLY || USE_RANDOM_OPPORTUNITIES) validationPassed = false;
  } else if (totalChildren !== 0 && childOrphans === totalChildren) {
    logError(`\nFATAL ERROR: 100% of the ${totalChildren} harvested opportunities that reference a parent do not have a matching parent item from the parent feed, so all integration tests will fail.`);
    logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
    await fs.writeFile(`${OUTPUT_PATH}orphans.json`, JSON.stringify(getOrphanJson(state), null, 2));
    if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
      logError(`See ${OUTPUT_PATH}orphans.json for more information or visit http://localhost:${PORT}/orphans for more information\n`);
    } else {
      logError(`See ${OUTPUT_PATH}orphans.json for more information\n`);
    }
    validationPassed = false;
  } else if (childOrphans > 0) {
    logError(`\nFATAL ERROR: ${childOrphans} of ${totalChildren} opportunities that reference a parent (${percentageChildOrphans}%) do not have a matching parent item from the parent feed.`);
    logError('Please ensure that the value of the `subEvent` or `facilityUse` property in each opportunity exactly matches an `@id` from the parent feed.\n');
    await fs.writeFile(`${OUTPUT_PATH}orphans.json`, JSON.stringify(getOrphanJson(state), null, 2));
    if (!VALIDATE_ONLY && !IS_RUNNING_IN_CI) {
      logError(`See ${OUTPUT_PATH}orphans.json for more information or visit http://localhost:${PORT}/orphans for more information\n`);
    } else {
      logError(`See ${OUTPUT_PATH}orphans.json for more information\n`);
    }
    validationPassed = false;
  }

  if (validatorWorkerPool.getValidationResults().size > 0) {
    await fs.writeFile(`${OUTPUT_PATH}validation-errors.html`, await renderValidationErrorsHtml(validatorWorkerPool));
    const occurrenceCount = [...validatorWorkerPool.getValidationResults().values()].reduce((total, result) => total + result.occurrences, 0);
    logError(`\nFATAL ERROR: Validation errors were found in the opportunity data feeds. ${occurrenceCount} errors were reported of which ${validatorWorkerPool.getValidationResults().size} were unique.`);
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

  // Since all feeds are now completed, trigger responses to healthcheck
  unlockHealthCheck();
}

/**
 * Resolve all pending /health-check requests and set subsequent requests to
 * resolve immediately.
 */
function unlockHealthCheck() {
  state.healthCheckResponsesWaitingForHarvest.forEach((res) => res.send('openactive-broker'));
  // Clear response array
  state.healthCheckResponsesWaitingForHarvest.splice(0, state.healthCheckResponsesWaitingForHarvest.length);
  // Mark all feeds as complete
  state.incompleteFeeds.markFeedHarvestCompleteAll();
}

function getConfig() {
  return {
    // Allow a consistent startDate to be used when calling test-interface-criteria
    harvestStartTime: HARVEST_START_TIME,
    // Base URL used by the integration tests
    bookingApiBaseUrl: state.datasetSiteJson.accessService?.endpointUrl,
    // Base URL used by the authentication tests
    authenticationAuthority: state.datasetSiteJson.accessService?.authenticationAuthority,
    ...state.globalAuthKeyManager.config,
    headlessAuth: HEADLESS_AUTH,
  };
}

/**
 * For an Opportunity being harvested from RPDE, check if there is a two-phase
 * listener listening for it.
 *
 * If so, respond to that listener.
 *
 * @param {string} id
 * @param {any} item
 */
function doNotifyTwoPhaseOpportunityListener(id, item) {
  TwoPhaseListeners.doNotifyListener(state.twoPhaseListeners.byOpportunityId, id, item);
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
  const listenerId = TwoPhaseListeners.getOrderListenerId(type, bookingPartnerIdentifier, uuid);
  TwoPhaseListeners.doNotifyListener(state.twoPhaseListeners.byOrderUuid, listenerId, item);
}

/**
 * @param {string} opportunityId
 * @param {boolean} useCacheIfAvailable If true, the Opportunity will be searched for in the cache. If it's already in
 *   there and matches the `doesItemMatchCriteria` spec, this will be returned.
 *   If false, the Opportunity will only be searched for in coming RPDE updates.
 * @param {(opportunity: unknown) => boolean} doesItemMatchCriteria
 * @param {import('express').Response} res If/when Opportunity is found, it will be passed to `res`. This will happen asynchronously if
 *   the Opportunity is not found in the cache.
 */
function doOnePhaseListenForOpportunity(opportunityId, useCacheIfAvailable, doesItemMatchCriteria, res) {
  state.onePhaseListeners.opportunity.createListener(opportunityId, doesItemMatchCriteria, res);

  if (useCacheIfAvailable) {
    const cachedResponse = getOpportunityMergedWithParentById(state, opportunityId);
    if (cachedResponse) {
      if (CONSOLE_OUTPUT_LEVEL === 'dot') {
        logCharacter('.');
      } else {
        log(`used cached response for "${opportunityId}"`);
      }
      const { didRespond } = state.onePhaseListeners.opportunity.doRespondToAndDeleteListenerIfExistsAndMatchesCriteria(opportunityId, {
        // Make it into an RPDE item-ish - as these are the items that onePhaseListeners.opportunity deals with.
        data: cachedResponse,
      });
      if (didRespond) {
        return;
      }
    }
  }
  // It hasn't been found
  if (CONSOLE_OUTPUT_LEVEL === 'dot') {
    logCharacter('.');
  } else {
    log(`listening for "${opportunityId}"`);
  }
}

/**
 * @param {import('./models/core').Opportunity} opportunity
 * @returns {string[]} An opportunity can support multiple Booking Flows as these are in the Offers. An Opportunity
 *   can have an Offer requiring approval and one that does not.
 */
function detectOpportunityBookingFlows(opportunity) {
  const offers = opportunity.offers || (opportunity.superEvent || opportunity.facilityUse)?.offers;
  if (!offers) {
    throw new Error(`Opportunity (ID: ${opportunity['@id']}) has no offers in superEvent/facilityUse`);
  }

  if (!Array.isArray(offers)) {
    throw new Error(`Opportunity (ID: ${opportunity['@id']}) offers is not an array`);
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

/**
 * @typedef {(
 *   rpdePage: any,
 *   feedIdentifier: string,
 *   isInitialHarvestComplete: () => boolean,
 *   validateItemsFn: (items: any[], isInitialHarvestComplete: () => boolean) => Promise<void>,
 * ) => Promise<void>} RpdePageProcessorAndValidator
 */

/**
 * For a given RPDE page of items (of a parent Opportunity feed e.g. SessionSeries),
 * cache the items and notify any listeners that are looking for the parent Opportunity
 * or any of its children.
 *
 * @type {RpdePageProcessorAndValidator}
 */
async function ingestParentOpportunityPage(rpdePage, feedIdentifier, isInitialHarvestComplete, validateItemsFn) {
  const feedPrefix = `${feedIdentifier}---`;

  // Some feeds have FacilityUse as the top-level items with embedded
  // IndividualFacilityUse data. The Slot feed facilityUse associations link to
  // these embedded IndividualFacilityUses. However the rest of the code assumes
  // the linked item is the top-level item from the parent feed, so we need to
  // invert the FacilityUse/IndividualFacilityUse relationship.
  const items = rpdePage.items.flatMap((item) => invertFacilityUseItemIfPossible(item));

  for (const item of items) {
    const feedItemIdentifier = feedPrefix + item.id;

    // State = updated
    if (item.state !== 'deleted') {
      // Each item here can be one of four things:
      // - an inverted IndividualFacilityUse with FacilityUse ,
      // - a FacilityUse without IndividualFacilityUse,
      // - a SessionSeries without subEvents
      // - a SessionSeries with subEvents
      // All three of these are parent opportunities, and so can initially be processed in the same way ie store some data in the parent maps
      // However the third (with subEvents) requires additional processing, which is explained below

      // Store the parent opportunity data in the maps
      const jsonLdId = item.data['@id'] || item.data.id;

      state.opportunityHousekeepingCaches.parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.opportunityCache.parentMap.set(jsonLdId, item.data);

      // If there are subEvents then we have a basic "small provider" SessionSeries feed. This is not
      // recommended, but we support it anyway here. We do this by converting each of the embedded
      // subEvents to its own opportunityItem, taking information from the subEvent itself as well as
      // from the item in which it is embedded. This mimics the way that the event would be seen in a
      // ScheduledSession feed.
      if (item.data.subEvent) {
        for (const subEvent of item.data.subEvent) {
          // Having an ID is crucial for dealing with subEvents, as it is needed to assess whether or not to
          // keep or delete the associated opportunityItem when this item is met again in the RPDE feed. If a
          // subEvent does not have an ID, then we don't make and store an opportunityItem at all, just skip
          // it and move on. This issue will still be discovered later in the RPDE feed check, and alert the
          // user without a harsh process exit.
          if ((subEvent['@id'] || subEvent.id) && (subEvent['@type'] || subEvent.type)) {
            const opportunityItem = createItemFromSubEvent(subEvent, item);
            storeChildOpportunityItem(opportunityItem);
          }
        }

        // As the subEvents don't have their own individual "state" fields showing whether or not they are
        // "updated" or "deleted", we have to infer this from whether or not they were present when this
        // item was last encountered. In order to do so, we keep a list of the subEvent IDs mapped to the
        // jsonLdId of the containing item in "parentOpportunitySubEventMap". If an old subEvent is not
        // present in the list of new subEvents, then it has been deleted and so we remove the associated
        // opportunityItem data. If a new subEvent is not present in the list of old subEvents, then we
        // record its ID in the list for the next time this check is done.
        updateParentOpportunitySubEventMap(item, jsonLdId);
      }
    } else {
      // State = deleted
      const jsonLdId = state.opportunityHousekeepingCaches.parentOpportunityRpdeMap.get(feedItemIdentifier);

      // If we had subEvents for this item, then we must be sure to delete the associated opportunityItems
      // that were made for them:
      if (state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
        for (const subEventId of state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
          deleteChildOpportunityItem(subEventId);
        }
      }

      state.opportunityHousekeepingCaches.parentOpportunityRpdeMap.delete(feedItemIdentifier);
      state.opportunityCache.parentMap.delete(jsonLdId);
      state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.delete(jsonLdId);
    }
  }

  // Validate the original feed
  await validateItemsFn(rpdePage.items, isInitialHarvestComplete);

  // As these parent opportunities have been updated, update all child items for these parent IDs
  await touchChildOpportunityItems(items
    .filter((item) => item.state !== 'deleted')
    .map((item) => item.data['@id'] || item.data.id));
}

/**
 *
 * @param {{data: {subEvent: {'@id'?: string, id?:string}[]}}} item
 * @param {string} jsonLdId
 */
function updateParentOpportunitySubEventMap(item, jsonLdId) {
  const oldSubEventIds = state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId);
  const newSubEventIds = item.data.subEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter((x) => x);

  if (!oldSubEventIds) {
    if (newSubEventIds.length > 0) {
      state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.set(jsonLdId, newSubEventIds);
    }
  } else {
    for (const subEventId of oldSubEventIds) {
      if (!newSubEventIds.includes(subEventId)) {
        deleteChildOpportunityItem(subEventId);
        state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId).filter((x) => x !== subEventId);
      }
    }
    for (const subEventId of newSubEventIds) {
      if (!oldSubEventIds.includes(subEventId)) {
        state.opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId).push(subEventId);
      }
    }
  }
}

/**
 * For a given RPDE page of items (of a child Opportunity feed e.g. ScheduledSession),
 * cache the items and notify any listeners that are looking for it.
 *
 * @type {RpdePageProcessorAndValidator}
 */
async function ingestChildOpportunityPage(rpdePage, feedIdentifier, isInitialHarvestComplete, validateItemsFn) {
  const feedPrefix = `${feedIdentifier}---`;
  for (const item of rpdePage.items) {
    const feedItemIdentifier = feedPrefix + item.id;
    if (item.state === 'deleted') {
      const jsonLdId = state.opportunityHousekeepingCaches.opportunityRpdeMap.get(feedItemIdentifier);
      state.opportunityCache.childMap.delete(jsonLdId);
      state.opportunityHousekeepingCaches.opportunityRpdeMap.delete(feedItemIdentifier);

      deleteChildOpportunityItem(jsonLdId);
    } else {
      const jsonLdId = item.data['@id'] || item.data.id;
      state.opportunityHousekeepingCaches.opportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.opportunityCache.childMap.set(jsonLdId, item.data);

      await storeChildOpportunityItem(item);
    }
  }
  await validateItemsFn(rpdePage.items, isInitialHarvestComplete);
}

/**
 * Given a collection of parent Opportunity IDs which have just been updated,
 * trigger any actions (e.g. notifying listeners) that should be triggered when
 * an Opportunity (or child/parent pair) is updated.
 *
 * @param {string[]} parentIds
 */
async function touchChildOpportunityItems(parentIds) {
  const opportunitiesToUpdate = new Set();

  // Get IDs of all opportunities which are children of the specified parents.
  parentIds.forEach((parentId) => {
    if (state.opportunityItemRowCache.parentIdIndex.has(parentId)) {
      state.opportunityItemRowCache.parentIdIndex.get(parentId).forEach((jsonLdId) => {
        opportunitiesToUpdate.add(jsonLdId);
      });
    }
  });

  await Promise.all([...opportunitiesToUpdate].map(async (jsonLdId) => {
    if (state.opportunityItemRowCache.store.has(jsonLdId)) {
      const row = state.opportunityItemRowCache.store.get(jsonLdId);
      row.feedModified = `${Date.now() + 1000}`; // 1 second in the future
      row.waitingForParentToBeIngested = false;
      await processRow(row);
    }
  }));
}

/**
 * Delete a (child) Opportunity from parts of the cache.
 *
 * @param {string} jsonLdId
 */
function deleteChildOpportunityItem(jsonLdId) {
  const row = state.opportunityItemRowCache.store.get(jsonLdId);
  if (row) {
    const idx = state.opportunityItemRowCache.parentIdIndex.get(row.jsonLdParentId);
    if (idx) {
      idx.delete(jsonLdId);
    }
    state.opportunityItemRowCache.store.delete(jsonLdId);
  }
}

/**
 * Store (child) Opportunity to parts of the cache. Notify any listeners if
 * the child and parent both exist.
 *
 * @param {import('./models/core').RpdeItem} item
 */
async function storeChildOpportunityItem(item) {
  if (item.state === 'deleted') throw new Error('Not expected to be called for deleted items');

  /**
   * @type {import('./models/core').OpportunityItemRow}
   */
  const row = {
    id: item.id,
    modified: item.modified,
    deleted: false,
    feedModified: `${Date.now() + 1000}`, // 1 second in the future,
    jsonLdId: item.data['@id'] || item.data.id || null,
    jsonLd: item.data,
    jsonLdType: item.data['@type'] || item.data.type,
    jsonLdParentId: !jsonLdHasReferencedParent(item.data) ? null : item.data.superEvent || item.data.facilityUse,
    waitingForParentToBeIngested: jsonLdHasReferencedParent(item.data) && !(state.opportunityCache.parentMap.has(item.data.superEvent) || state.opportunityCache.parentMap.has(item.data.facilityUse)),
  };

  if (row.jsonLdId == null) {
    throw new FatalError(`RPDE item '${item.id}' of kind '${item.kind}' does not have an @id. All items in the feeds must have an @id within the "data" property.`);
  }
  // Associate the child with its parent
  if (row.jsonLdParentId != null) {
    if (!state.opportunityItemRowCache.parentIdIndex.has(row.jsonLdParentId)) state.opportunityItemRowCache.parentIdIndex.set(row.jsonLdParentId, new Set());
    state.opportunityItemRowCache.parentIdIndex.get(row.jsonLdParentId).add(row.jsonLdId);
  }

  // Cache it
  state.opportunityItemRowCache.store.set(row.jsonLdId, row);

  // If child and parent both exist, notify any listeners, etc
  if (!row.waitingForParentToBeIngested) {
    await processRow(row);
  }
}

/**
 * Merge a child- and parent- opportunity and then save them to the
 * criteria-oriented cache and notify any listeners.
 *
 * @param {import('./models/core').OpportunityItemRow} row
 */
async function processRow(row) {
  // Create an RPDE item that contains both the child and its merged parent
  /** @type {Omit<import('./models/core').RpdeItem, 'kind'>} */
  let newItem;
  if (row.jsonLdParentId === null) {
    newItem = {
      state: row.deleted ? 'deleted' : 'updated',
      id: row.jsonLdId,
      modified: `${row.feedModified}`,
      data: row.jsonLd,
    };
  } else {
    const parentOpportunity = state.opportunityCache.parentMap.get(row.jsonLdParentId);
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
      modified: `${row.feedModified}`,
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

/**
 * Save a (merged i.e. child-with-parent) opportunity to criteria-oriented
 * cache and notify any listeners.
 *
 * @param {Omit<import('./models/core').RpdeItem, 'kind'>} item
 */
async function processOpportunityItem(item) {
  if (!item.data) {
    return;
  }
  const id = item.data['@id'] || item.data.id;

  // Store opportunity to criteria-oriented cache
  const matchingCriteria = [];
  const unmetCriteriaDetails = [];

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
        if (criteriaResult.matchesCriteria) {
          CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(
            state.criteriaOrientedOpportunityIdCache,
            id,
            {
              criteriaName, bookingFlow, opportunityType, sellerId,
            },
          );
        } else {
          CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(
            state.criteriaOrientedOpportunityIdCache,
            id,
            criteriaResult.unmetCriteriaDetails,
            {
              criteriaName, bookingFlow, opportunityType, sellerId,
            },
          );
          unmetCriteriaDetails.push(...criteriaResult.unmetCriteriaDetails);
        }
      }
    }
  }

  // Notify one-phase opportunity listeners
  const { didRespond } = state.onePhaseListeners.opportunity.doRespondToAndDeleteListenerIfExistsAndMatchesCriteria(id, item);

  if (VERBOSE) {
    const bookableIssueList = unmetCriteriaDetails.length > 0
      ? `\n   [Unmet Criteria: ${Array.from(new Set(unmetCriteriaDetails)).join(', ')}]` : '';
    if (didRespond) {
      log(`seen ${matchingCriteria.join(', ')} and dispatched ${id}${bookableIssueList}`);
    } else {
      log(`saw ${matchingCriteria.join(', ')} ${id}${bookableIssueList}`);
    }
  }

  // Notify two-phase opportunity listeners
  doNotifyTwoPhaseOpportunityListener(id, item);
}

/**
 * An RPDE page processor for the Orders RPDE feed. It ensure that any Order
 * listeners are notified of Order updates.
 *
 * @param {OrderFeedType} orderFeedType
 * @param {string} bookingPartnerIdentifier
 * @returns {import('@openactive/harvesting-utils').RpdePageProcessor}
 */
function monitorOrdersPage(orderFeedType, bookingPartnerIdentifier) {
  /* Note that the Orders RpdePageProcessor does NOT use validateItemsFn i.e. Orders feed items are not validated.
  The reasoning being that the feed _should_ be empty in controlled mode as previously created Orders will have been
  deleted via the Test Interface.
  TODO implement validation (https://github.com/openactive/openactive-test-suite/issues/666) */
  return async (rpdePage) => {
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

async function startPolling() {
  // Ready directories for temporary files used by Broker
  await Promise.all([
    mkdirp(VALIDATOR_TMP_DIR),
    setUpValidatorInputs(),
    mkdirp(OUTPUT_PATH),
  ]);

  /* Limit validator to 5 minutes if WAIT_FOR_HARVEST is set. If
  WAIT_FOR_HARVEST is set, then the integration tests are waiting for Broker to
  finish harvesting before they start. Validation of a potentially large feed's
  worth of data (e.g. in random mode) is computationally more expensive than
  just fetching the feed and so lags behind. Ideally, Broker validates the feed
  as much as possible, but the primary purpose of Test Suite is to check the
  outcomes of different scenarios. And so, we put a max validation time on
  Broker when WAIT_FOR_HARVEST is set. */
  const validatorTimeoutMs = WAIT_FOR_HARVEST ? 1000 * 60 * 5 : null;
  const validatorWorkerPool = new ValidatorWorkerPool(validatorTimeoutMs);
  validatorWorkerPool.run();
  // It needs to be stored in global state just so that it can be easily accessed in the GET /validation-errors route
  setGlobalValidatorWorkerPool(validatorWorkerPool);

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

  /** @type {Promise[]} Promises that resolve when the harvester has exited due to fatal error */
  const harvesterExitPromises = [];

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

  // Start polling for all Opportunity feeds concurrently
  harvesterExitPromises.push(
    ...dataset.distribution.map((datasetDistributionItem) => (
      startPollingForOpportunityFeed(datasetDistributionItem, {
        validatorWorkerPool,
      })
    )),
  );

  // Only poll orders feed if included in the dataset site
  if (!VALIDATE_ONLY && !DO_NOT_HARVEST_ORDERS_FEED && dataset.accessService && dataset.accessService.endpointUrl) {
    for (const { feedUrl, type, feedContextIdentifier, bookingPartnerIdentifier: feedBookingPartnerIdentifier } of BOOKING_PARTNER_IDENTIFIERS.flatMap((bookingPartnerIdentifier) => [
      {
        feedUrl: `${dataset.accessService.endpointUrl}/orders-rpde`,
        type: /** @type {OrderFeedType} */('orders'),
        feedContextIdentifier: orderFeedContextIdentifier(ORDERS_FEED_IDENTIFIER, bookingPartnerIdentifier),
        bookingPartnerIdentifier,
      },
      {
        feedUrl: `${dataset.accessService.endpointUrl}/order-proposals-rpde`,
        type: /** @type {OrderFeedType} */('order-proposals'),
        feedContextIdentifier: orderFeedContextIdentifier(ORDER_PROPOSALS_FEED_IDENTIFIER, bookingPartnerIdentifier),
        bookingPartnerIdentifier,
      },
    ])) {
      log(`Found ${type} feed: ${feedUrl}`);
      harvesterExitPromises.push(
        startPollingForOrderFeed(feedUrl, type, feedContextIdentifier, feedBookingPartnerIdentifier, {
          validatorWorkerPool,
        }),
      );
    }
  }

  // Finished processing dataset site
  if (WAIT_FOR_HARVEST) log('\nBlocking integration tests to wait for harvest completion...');
  await setFeedIsUpToDate(validatorWorkerPool, 'DatasetSite', {
    multibar: state.multibar,
  });

  // Wait until all harvesters error catastrophically before exiting
  await Promise.all(harvesterExitPromises);
}

/**
 * Maps a Dataset Distribution item's additionalType to whether or not it is a parent feed.
 */
const DATASET_ADDITIONAL_TYPE_TO_IS_PARENT_FEED = {
  'https://openactive.io/SessionSeries': true,
  'https://openactive.io/FacilityUse': true,
  'https://openactive.io/IndividualFacilityUse': true,
  'https://openactive.io/ScheduledSession': false,
  'https://openactive.io/Slot': false,
  'https://schema.org/Event': false,
  'https://schema.org/OnDemandEvent': false,
};

/**
 * @param {any} datasetDistributionItem
 * @param {object} args
 * @param {ValidatorWorkerPool} args.validatorWorkerPool
 */
async function startPollingForOpportunityFeed(datasetDistributionItem, { validatorWorkerPool }) {
  const feedContextIdentifier = datasetDistributionItem.identifier || datasetDistributionItem.name || datasetDistributionItem.additionalType;
  const feedContext = createBrokerFeedContext(feedContextIdentifier, datasetDistributionItem.contentUrl, state.multibar);

  // Set-up parallel validation for items in this feed
  const onValidateItemsForThisFeed = partial(onValidateItems, feedContext);
  validatorWorkerPool.setOnValidateItems(feedContextIdentifier, onValidateItemsForThisFeed);

  const sendItemsToValidatorWorkerPoolForThisFeed = partial(sendItemsToValidatorWorkerPool, {
    feedContextIdentifier,
    addToTotalItemsQueuedForValidation(addition) {
      feedContext.totalItemsQueuedForValidation += addition;
    },
  });

  const setFeedEnded = async () => {
    await setFeedIsUpToDate(validatorWorkerPool, feedContextIdentifier, {
      multibar: state.multibar,
    });
  };
  const onReachedEndOfFeed = createOnReachedEndOfFeedFn(setFeedEnded, feedContext);

  // Harvest a parent opportunity feed
  if (DATASET_ADDITIONAL_TYPE_TO_IS_PARENT_FEED[datasetDistributionItem.additionalType] === true) {
    log(`Found parent opportunity feed: ${datasetDistributionItem.contentUrl}`);
    state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
    const ingestParentOpportunityPageForThisFeed = partialRight(ingestParentOpportunityPage, sendItemsToValidatorWorkerPoolForThisFeed);

    storeFeedContext(feedContextIdentifier, feedContext);
    const harvestRpdeResponse = await harvestRPDELossless({
      baseUrl: datasetDistributionItem.contentUrl,
      feedContextIdentifier,
      headers: withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
      processPage: createOnProcessedPageFn(feedContext, ingestParentOpportunityPageForThisFeed),
      onReachedEndOfFeed,
      onRetryDueToHttpError: async () => { },
      optionallyWaitBeforeNextRequest: optionallyWaitBeforeNextHarvestRpdeRequest,
      isOrdersFeed: false,
      overrideContext: feedContext,
      loggingFns: {
        log, logError, logErrorDuringHarvest,
      },
      config: {
        howLongToSleepAtFeedEnd: harvestRpdeHowLongToSleepAtFeedEnd,
        REQUEST_LOGGING_ENABLED,
      },
    });
    await handleHarvestRpdeErrorResponse({
      setFeedEnded,
      feedContextIdentifier,
      isOrdersFeed: false,
    }, harvestRpdeResponse);
    return;
  }
  // Harvest a child opportunity feed
  if (DATASET_ADDITIONAL_TYPE_TO_IS_PARENT_FEED[datasetDistributionItem.additionalType] === false) {
    log(`Found opportunity feed: ${datasetDistributionItem.contentUrl}`);
    state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
    const ingestOpportunityPageForThisFeed = partialRight(ingestChildOpportunityPage, sendItemsToValidatorWorkerPoolForThisFeed);

    storeFeedContext(feedContextIdentifier, feedContext);
    const harvestRpdeResponse = await harvestRPDELossless({
      baseUrl: datasetDistributionItem.contentUrl,
      feedContextIdentifier,
      headers: withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
      processPage: createOnProcessedPageFn(feedContext, ingestOpportunityPageForThisFeed),
      onReachedEndOfFeed,
      onRetryDueToHttpError: async () => { },
      optionallyWaitBeforeNextRequest: optionallyWaitBeforeNextHarvestRpdeRequest,
      isOrdersFeed: false,
      overrideContext: feedContext,
      loggingFns: {
        log, logError, logErrorDuringHarvest,
      },
      config: {
        howLongToSleepAtFeedEnd: harvestRpdeHowLongToSleepAtFeedEnd,
        REQUEST_LOGGING_ENABLED,
      },
    });
    await handleHarvestRpdeErrorResponse({
      setFeedEnded,
      feedContextIdentifier,
      isOrdersFeed: false,
    }, harvestRpdeResponse);
    return;
  }
  logError(`\nERROR: Found unsupported feed in dataset site "${datasetDistributionItem.contentUrl}" with additionalType "${datasetDistributionItem.additionalType}"`);
  logError(`Only the following additionalType values are supported: \n${Object.keys(DATASET_ADDITIONAL_TYPE_TO_IS_PARENT_FEED).map((x) => `- "${x}"`).join('\n')}'`);
}

/**
 * @param {string} feedUrl
 * @param {OrderFeedType} type
 * @param {string} feedContextIdentifier
 * @param {string} feedBookingPartnerIdentifier
 * @param {object} args
 * @param {ValidatorWorkerPool} args.validatorWorkerPool
 */
async function startPollingForOrderFeed(feedUrl, type, feedContextIdentifier, feedBookingPartnerIdentifier, { validatorWorkerPool }) {
  const feedContext = createBrokerFeedContext(feedContextIdentifier, feedUrl, state.multibar);

  const setFeedEnded = async () => {
    OrderUuidTracking.doTrackEndOfFeed(state.orderUuidTracking, type, feedBookingPartnerIdentifier);
    await setFeedIsUpToDate(validatorWorkerPool, feedContextIdentifier, {
      multibar: state.multibar,
    });
  };
  const onReachedEndOfFeed = createOnReachedEndOfFeedFn(setFeedEnded, feedContext);

  state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
  storeFeedContext(feedContextIdentifier, feedContext);
  const harvestRpdeResponse = await harvestRPDELossless({
    baseUrl: feedUrl,
    feedContextIdentifier,
    headers: withOrdersRpdeHeaders(getOrdersFeedHeader(feedBookingPartnerIdentifier)),
    processPage: createOnProcessedPageFn(feedContext, monitorOrdersPage(type, feedBookingPartnerIdentifier)),
    onReachedEndOfFeed,
    onRetryDueToHttpError: async () => {
      // Do not wait for the Orders feed if failing (as it might be an auth error)
      if (WAIT_FOR_HARVEST || VALIDATE_ONLY) {
        await setFeedEnded();
      }
    },
    optionallyWaitBeforeNextRequest: optionallyWaitBeforeNextHarvestRpdeRequest,
    isOrdersFeed: true,
    overrideContext: feedContext,
    loggingFns: {
      log, logError, logErrorDuringHarvest,
    },
    config: {
      howLongToSleepAtFeedEnd: harvestRpdeHowLongToSleepAtFeedEnd,
      REQUEST_LOGGING_ENABLED,
    },
  });
  await handleHarvestRpdeErrorResponse({
    setFeedEnded,
    feedContextIdentifier,
    isOrdersFeed: true,
  }, harvestRpdeResponse);
}

/**
 * @param {() => Promise<void>} setFeedEnded
 * @param {import('./util/feed-context').BrokerFeedContext} feedContext
 *   ! This is mutated
 */
function createOnReachedEndOfFeedFn(setFeedEnded, feedContext) {
  /**
   * @param {object} params
   * @param {string} params.lastPageUrl
   * @param {boolean} params.isInitialHarvestComplete
   * @param {number} params.responseTime
   */
  return async ({ lastPageUrl, isInitialHarvestComplete, responseTime }) => {
    // Update progress bar to indicate that the feed has been harvested (if this
    // is the initial harvest - subsequent harvests don't get progress bars)
    if (!isInitialHarvestComplete) {
      if (feedContext._progressbar) {
        feedContext._progressbar.update(feedContext.validatedItems, {
          pages: feedContext.pageIndex,
          responseTime: Math.round(responseTime),
          ...getMultibarProgressFromContext(feedContext),
          status: feedContext.items === 0 ? 'Harvesting Complete (No items to validate)' : 'Harvesting Complete, Validating...',
        });
        feedContext._progressbar.setTotal(feedContext.totalItemsQueuedForValidation);
      }
    }

    if (WAIT_FOR_HARVEST || VALIDATE_ONLY) {
      await setFeedEnded();
    } else if (VERBOSE) log(`Sleep mode poll for RPDE feed "${lastPageUrl}"`);

    // eslint-disable-next-line no-param-reassign
    feedContext.sleepMode = true;
    if (feedContext.timeToHarvestCompletion === undefined) {
    // eslint-disable-next-line no-param-reassign
      feedContext.timeToHarvestCompletion = millisToMinutesAndSeconds((new Date()).getTime() - state.startTime.getTime());
    }
  };
}

/**
 * @param {import('./util/feed-context').BrokerFeedContext} feedContext
 * @param {(rpdePage: any,feedIdentifier: string, isInitialHarvestComplete: () => boolean) => Promise<void>} internalProcessPageFn
 */
function createOnProcessedPageFn(feedContext, internalProcessPageFn) {
  /**
   * @param {object} params
   * @param {any} params.rpdePage
   * @param {string} params.feedContextIdentifier
   * @param {() => boolean} params.isInitialHarvestComplete
   * @param {number} params.responseTime
   */
  return async ({
    rpdePage,
    feedContextIdentifier,
    isInitialHarvestComplete,
    responseTime,
  }) => {
    await internalProcessPageFn(rpdePage, feedContextIdentifier, isInitialHarvestComplete);

    if (!isInitialHarvestComplete && feedContext._progressbar) {
      feedContext._progressbar.update(feedContext.validatedItems, {
        pages: feedContext.pageIndex,
        responseTime: Math.round(responseTime),
        ...getMultibarProgressFromContext(feedContext),
      });
      feedContext._progressbar.setTotal(feedContext.totalItemsQueuedForValidation);
    }
  };
}

/**
 * @param {object} config
 * @param {() => Promise<void>} config.setFeedEnded
 * @param {string} config.feedContextIdentifier
 * @param {boolean} config.isOrdersFeed
 * @param {import('@openactive/harvesting-utils/built-types/src/models/HarvestRpde').HarvestRpdeResponse} response
 */
async function handleHarvestRpdeErrorResponse({
  setFeedEnded,
  feedContextIdentifier,
  isOrdersFeed,
}, response) {
  // Do not wait for the Orders feed if failing (as it might be an auth error)
  if ((WAIT_FOR_HARVEST || VALIDATE_ONLY) && isOrdersFeed) {
    await setFeedEnded();
  }
  const { error } = response;
  switch (error.type) {
    case 'feed-not-found': {
      const feedContext = state.feedContextMap.get(feedContextIdentifier);
      if (state.multibar) state.multibar.remove(feedContext._progressbar);
      if ((WAIT_FOR_HARVEST || VALIDATE_ONLY) && !isOrdersFeed) {
        await setFeedEnded();
      }
      state.feedContextMap.delete(feedContextIdentifier);
      // Ignore Order Proposals feed not found errors as many implementations
      // do not support this type of feed.
      if (feedContextIdentifier.indexOf(ORDER_PROPOSALS_FEED_IDENTIFIER) > 0) {
        return;
      }
      const pdi = pageDescriptiveIdentifier(feedContextIdentifier, error.reqUrl, error.reqHeaders);
      logErrorDuringHarvest(`Not Found error for ${pdi}, feed will be ignored.`);
      break;
    }
    case 'unexpected-non-http-error': {
      if (state.multibar) state.multibar.stop();
      logErrorDuringHarvest(`\nFATAL ERROR: ${error.message}`);
      process.exit(1);
      break;
    }
    case 'rpde-validation-error': {
      if (state.multibar) state.multibar.stop();
      const pdi = pageDescriptiveIdentifier(feedContextIdentifier, error.reqUrl, error.reqHeaders);
      logErrorDuringHarvest(
        `\nFATAL ERROR: RPDE Validation Error(s) found on ${pdi}:\n${error.rpdeValidationErrors
          // @ts-expect-error This will be fixed when RPDE validation errors get types
          .map((rpdeValidationError) => `- ${rpdeValidationError.message.split('\n')[0]}`)
          .join('\n')}\n`,
      );
      process.exit(1);
      break;
    }
    case 'retry-limit-exceeded-for-http-error': {
      if (state.multibar) state.multibar.stop();
      const pdi = pageDescriptiveIdentifier(feedContextIdentifier, error.reqUrl, error.reqHeaders);
      logErrorDuringHarvest(`\nFATAL ERROR: Retry limit exceeded for ${pdi}\n`);
      process.exit(1);
      break;
    }
    default:
      process.exit(1);
  }
}

async function optionallyWaitBeforeNextHarvestRpdeRequest() {
  // If harvesting is paused, block using the mute
  if (state.pauseResume) await state.pauseResume.waitIfPaused();
}

/**
 * @param {string} feedContextIdentifier
 * @param {string} reqUrl
 * @param {Record<string, string>} reqHeaders
 */
function pageDescriptiveIdentifier(feedContextIdentifier, reqUrl, reqHeaders) {
  return `RPDE feed ${feedContextIdentifier} page "${reqUrl}" (request headers: ${JSON.stringify(reqHeaders)})`;
}

/**
 * @param {string} feedContextIdentifier
 * @param {import('./util/feed-context').BrokerFeedContext} feedContext
 */
function storeFeedContext(feedContextIdentifier, feedContext) {
  if (state.feedContextMap.has(feedContextIdentifier)) {
    throw new Error('Duplicate feed identifier not permitted within dataset distribution.');
  }
  state.feedContextMap.set(feedContextIdentifier, feedContext);
}

/**
 * Event listener for HTTP server "error" event.
 */

function onHttpServerError(error) {
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

/**
 * @param {object} args
 * @param {string} args.feedContextIdentifier
 * @param {(addition: number) => void} args.addToTotalItemsQueuedForValidation
 * @param {any[]} items RPDE items
 * @param {() => boolean} isInitialHarvestComplete
 */
async function sendItemsToValidatorWorkerPool({
  feedContextIdentifier,
  addToTotalItemsQueuedForValidation,
}, items, isInitialHarvestComplete) {
  if (isInitialHarvestComplete()) { return; }
  const numItemsQueuedForValidation = await createAndSaveValidatorInputsFromRpdePage(feedContextIdentifier, items);
  addToTotalItemsQueuedForValidation(numItemsQueuedForValidation);
}

/**
 * Callback called after a batch of items is validated from an opportunity
 * feed. Updates the progress bar.
 *
 * @param {import('./util/feed-context').BrokerFeedContext} context
 * @param {number} numItems
 */
function onValidateItems(context, numItems) {
  context.validatedItems += numItems;
  if (context._progressbar) {
    context._progressbar.setTotal(context.totalItemsQueuedForValidation);
    if (context.totalItemsQueuedForValidation - context.validatedItems === 0) {
      context._progressbar.update(context.validatedItems, {
        ...getMultibarProgressFromContext(context),
        status: 'Validation Complete',
      });
      context._progressbar.stop();
    } else {
      context._progressbar.update(context.validatedItems, getMultibarProgressFromContext(context));
    }
  }
}

function harvestRpdeHowLongToSleepAtFeedEnd() {
  // Slow down sleep polling while waiting for harvesting of other feeds to complete
  return WAIT_FOR_HARVEST && state.incompleteFeeds.anyFeedsStillHarvesting() ? 5000 : 500;
}

module.exports = {
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
};
