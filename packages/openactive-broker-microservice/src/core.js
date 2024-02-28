const sleep = require('util').promisify(setTimeout);
const fs = require('fs').promises;
const { default: axios } = require('axios');
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
const { isNil, omit, partition, partialRight } = require('lodash');
const { extractJSONLDfromHTML } = require('@openactive/dataset-utils');
const { harvestRPDE, createFeedContext, progressFromContext } = require('@openactive/harvesting-utils');
const { partial } = require('lodash');

const { OpportunityIdCache } = require('./util/opportunity-id-cache');
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
  DATASET_DISTRIBUTION_OVERRIDE,
  DO_NOT_FILL_BUCKETS,
  DO_NOT_HARVEST_ORDERS_FEED,
  LOG_AUTH_CONFIG,
  CONSOLE_OUTPUT_LEVEL,
  HEADLESS_AUTH,
  VALIDATOR_TMP_DIR,
  BOOKING_PARTNER_IDENTIFIERS,
} = require('./broker-config');
const { TwoPhaseListeners } = require('./twoPhaseListeners/twoPhaseListeners');
const { state, getTestDataset, getAllDatasets, setGlobalValidatorWorkerPool, getGlobalValidatorWorkerPool } = require('./state');
const { orderFeedContextIdentifier } = require('./util/feed-context-identifier');
const { withOrdersRpdeHeaders, getOrdersFeedHeader } = require('./util/request-utils');
const { OrderUuidTracking } = require('./order-uuid-tracking/order-uuid-tracking');
const { error400IfExpressParamsAreMissing } = require('./util/api-utils');
const { ValidatorWorkerPool } = require('./validator/validator-worker-pool');
const { setUpValidatorInputs, cleanUpValidatorInputs, createAndSaveValidatorInputsFromRpdePage } = require('./validator/validator-inputs');
const { renderSampleOpportunities } = require('./sample-opportunities');

/**
 * @typedef {import('./models/core').OrderFeedType} OrderFeedType
 * @typedef {import('./models/core').BookingPartnerIdentifier} BookingPartnerIdentifier
 */

const markdown = new Remarkable();

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
  res.send(getOrphanJson());
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getStatusRoute(req, res) {
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
  state.parentOpportunityMap.clear();
  state.parentOpportunityRpdeMap.clear();
  state.opportunityMap.clear();
  state.opportunityRpdeMap.clear();
  state.rowStoreMap.clear();
  state.parentIdIndex.clear();

  state.opportunityIdCache = OpportunityIdCache.create();

  res.status(204).send();
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getOpportunityCacheByIdRoute(req, res) {
  if (req.params.id) {
    const { id } = req.params;

    const cachedResponse = getOpportunityMergedWithParentById(id);

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
      error: `Opportunity of type '${opportunityType}' that has an \`organizer\`/\`provider\` with \`@id\` '${sellerId}', that also matched '${criteriaName}' within '${bookingFlow}', was not found within the feeds.`,
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
  // Get random opportunity ID
  const opportunity = req.body;
  const opportunityType = detectOpportunityType(opportunity);
  const sellerId = detectSellerId(opportunity);
  const testDatasetIdentifier = 'sample-opportunities';

  const criteriaName = opportunity['test:testOpportunityCriteria'].replace('https://openactive.io/test-interface#', '');
  const bookingFlow = opportunity['test:testOpenBookingFlow'].replace('https://openactive.io/test-interface#', '');

  const bookableOpportunity = getRandomBookableOpportunity({
    sellerId, bookingFlow, opportunityType, criteriaName, testDatasetIdentifier,
  });

  if (bookableOpportunity.opportunity) {
    const opportunityWithParent = getOpportunityMergedWithParentById(
      bookableOpportunity.opportunity['@id'],
    );
    const json = renderSampleOpportunities(opportunityWithParent, criteriaName, sellerId);
    res.json(json);
  } else {
    res.json({
      error: bookableOpportunity,
    });
  }
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
      suggestion: availableSellers ? 'Try setting sellers.primary.@id in the JSON config to one of the availableSellers below.' : `Check criteriaErrors below for reasons why '${opportunityType}' items in your feeds are not matching the criteria '${criteriaName}'.${typeBucket.criteriaErrors?.size > 0 ? ' The number represents the number of items that do not match.' : ''}`,
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

/**
 * @param {string} opportunityId
 */
function getOpportunityMergedWithParentById(opportunityId) {
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
  // If all feeds are now completed, trigger responses to healthcheck
  /* Signal for the Validator Worker Pool that we may stop once the validator timeout has run.
  Validator is an expensive process and is not completely necessary for Booking API testing. So we put a hard
  limit on how long it runs for (once all items are harvested).
  This means that, in some cases, only a subset of the results will be validated.
  Note that the worker pool will finish its current iteration if it has already reached the timeout. */
  await validatorWorkerPool.stopWhenTimedOut();
  await cleanUpValidatorInputs();

  if (multibar) multibar.stop();

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

  unlockHealthCheck();
}

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
  }
  if (map instanceof Set) {
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
  // @ts-ignore
  if (map instanceof Object) {
    // Hide any properties that start with the character '_' in objects, as these are not intended for display
    return Object.fromEntries(Object.entries(map).filter(([k]) => k.charAt(0) !== '_'));
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

/**
 * For an Opportunity being harvested from RPDE, check if there is a listener listening for it.
 *
 * If so, respond to that listener.
 *
 * @param {string} id
 * @param {any} item
 */
function doNotifyOpportunityListener(id, item) {
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
    const cachedResponse = getOpportunityMergedWithParentById(opportunityId);
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
    || opportunity?.facilityUse?.provider
    || opportunity?.facilityUse?.aggregateFacilityUse?.provider;

  if (typeof organizer === 'string') return organizer;

  return organizer?.['@id'] || organizer?.id;
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

/** @type {RpdePageProcessorAndValidator} */
async function ingestParentOpportunityPage(rpdePage, feedIdentifier, isInitialHarvestComplete, validateItemsFn) {
  const feedPrefix = `${feedIdentifier}---`;
  // Some feeds have FacilityUse as the top-level items with embedded
  // IndividualFacilityUse data. The Slot feed facilityUse associations link to
  // these embedded IndividualFacilityUses. However the rest of the code assumes
  // the linked item is the top-level item from the parent feed, so we need to
  // invert the FacilityUse/IndividualFacilityUse relationship.
  const items = invertFacilityUseItems(rpdePage.items);

  for (const item of items) {
    const feedItemIdentifier = feedPrefix + item.id;

    if (item.state !== 'deleted') {
      const jsonLdId = item.data['@id'] || item.data.id;

      state.parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.parentOpportunityMap.set(jsonLdId, item.data);

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
            const opportunityItemData = {
              ...subEvent,
            };
            opportunityItemData['@context'] = item.data['@context'];
            opportunityItemData.superEvent = item.data['@id'] || item.data.id;

            const opportunityItem = {
              id: subEvent['@id'] || subEvent.id,
              modified: item.modified,
              kind: subEvent['@type'] || subEvent.type,
              state: 'updated',
              data: opportunityItemData,
            };

            storeOpportunityItem(opportunityItem);
          }
        }

        // As the subEvents don't have their own individual "state" fields showing whether or not they are
        // "updated" or "deleted", we have to infer this from whether or not they were present when this
        // item was last encountered. In order to do so, we keep a list of the subEvent IDs mapped to the
        // jsonLdId of the containing item in "parentOpportunitySubEventMap". If an old subEvent is not
        // present in the list of new subEvents, then it has been deleted and so we remove the associated
        // opportunityItem data. If a new subEvent is not present in the list of old subEvents, then we
        // record its ID in the list for the next time this check is done.

        const oldSubEventIds = state.parentOpportunitySubEventMap.get(jsonLdId);
        const newSubEventIds = item.data.subEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter((x) => x);

        if (!oldSubEventIds) {
          if (newSubEventIds.length > 0) {
            state.parentOpportunitySubEventMap.set(jsonLdId, newSubEventIds);
          }
        } else {
          for (const subEventId of oldSubEventIds) {
            if (!newSubEventIds.includes(subEventId)) {
              deleteOpportunityItem(subEventId);
              state.parentOpportunitySubEventMap.get(jsonLdId).filter((x) => x !== subEventId);
            }
          }
          for (const subEventId of newSubEventIds) {
            if (!oldSubEventIds.includes(subEventId)) {
              state.parentOpportunitySubEventMap.get(jsonLdId).push(subEventId);
            }
          }
        }
      }
    } else {
      const jsonLdId = state.parentOpportunityRpdeMap.get(feedItemIdentifier);

      // If we had subEvents for this item, then we must be sure to delete the associated opportunityItems
      // that were made for them:
      if (state.parentOpportunitySubEventMap.get(jsonLdId)) {
        for (const subEventId of state.parentOpportunitySubEventMap.get(jsonLdId)) {
          deleteOpportunityItem(subEventId);
        }
      }

      state.parentOpportunityRpdeMap.delete(feedItemIdentifier);
      state.parentOpportunityMap.delete(jsonLdId);
      state.parentOpportunitySubEventMap.delete(jsonLdId);
    }
  }

  // Validate the original feed
  await validateItemsFn(rpdePage.items, isInitialHarvestComplete);

  // As these parent opportunities have been updated, update all child items for these parent IDs
  await touchOpportunityItems(items
    .filter((item) => item.state !== 'deleted')
    .map((item) => item.data['@id'] || item.data.id));
}

/** @type {RpdePageProcessorAndValidator} */
async function ingestOpportunityPage(rpdePage, feedIdentifier, isInitialHarvestComplete, validateItemsFn) {
  const feedPrefix = `${feedIdentifier}---`;
  for (const item of rpdePage.items) {
    const feedItemIdentifier = feedPrefix + item.id;
    if (item.state === 'deleted') {
      const jsonLdId = state.opportunityRpdeMap.get(feedItemIdentifier);
      state.opportunityMap.delete(jsonLdId);
      state.opportunityRpdeMap.delete(feedItemIdentifier);

      deleteOpportunityItem(jsonLdId);
    } else {
      const jsonLdId = item.data['@id'] || item.data.id;
      state.opportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
      state.opportunityMap.set(jsonLdId, item.data);

      await storeOpportunityItem(item);
    }
  }
  await validateItemsFn(rpdePage.items, isInitialHarvestComplete);
}

function invertFacilityUseItems(items) {
  const [invertibleFacilityUseItems, otherItems] = partition(items, (item) => item.data?.individualFacilityUse);
  if (invertibleFacilityUseItems.length < 1) return items;

  // Invert "FacilityUse" items so the the top-level `kind` is "IndividualFacilityUse"
  const invertedItems = [];
  for (const facilityUseItem of invertibleFacilityUseItems) {
    for (const individualFacilityUse of facilityUseItem.data.individualFacilityUse) {
      invertedItems.push({
        ...facilityUseItem,
        kind: individualFacilityUse['@type'],
        id: individualFacilityUse['@id'],
        data: {
          ...individualFacilityUse,
          '@context': facilityUseItem.data['@context'],
          aggregateFacilityUse: omit(facilityUseItem.data, ['individualFacilityUse', '@context']),
        },
      });
    }
  }

  return invertedItems.concat(otherItems);
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

function getMergedJsonLdContext(...opportunities) {
  return sortWithOpenActiveOnTop([...new Set(opportunities.flatMap((x) => x && x['@context']).filter((x) => x))]);
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

    doNotifyOpportunityListener(id, item);
  }
}

/**
 * @param {OrderFeedType} orderFeedType
 * @param {string} bookingPartnerIdentifier
 * @returns {import('@openactive/harvesting-utils/src/harvest-rpde').RpdePageProcessor}
 */
function monitorOrdersPage(orderFeedType, bookingPartnerIdentifier) {
  /* Note that the Orders RpdePageProcessor does NOT use validateItemsFn i.e. Orders feed items are not validated.
  The reasoning being that the feed _should_ be empty in controlled mode as previously created Orders will have been
  deleted via the Test Interface.
  TODO: Validate items in Orders feed as there will be some in there in the following use cases:
  - Random mode
  - Controlled mode but the Booking Partner is one that is also used outside of Test Suite (though this use case is
    not recommended). */
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

/**
 * Download the Dataset Site and extract the embedded JSON from it.
 *
 * @param {string} url
 */
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
  // Ready directories for temporary files used by Broker
  await Promise.all([
    mkdirp(VALIDATOR_TMP_DIR),
    setUpValidatorInputs(),
    mkdirp(OUTPUT_PATH),
  ]);

  // Limit validator to 5 minutes if WAIT_FOR_HARVEST is set
  // TODO2 why?
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
    const feedContextIdentifier = dataDownload.identifier || dataDownload.name || dataDownload.additionalType;
    const feedContext = createFeedContext(feedContextIdentifier, dataDownload.contentUrl, state.multibar);
    const onValidateItemsForThisFeed = partial(onValidateItems, feedContext);
    validatorWorkerPool.setOnValidateItems(feedContextIdentifier, onValidateItemsForThisFeed);

    const sendItemsToValidatorWorkerPoolForThisFeed = partial(sendItemsToValidatorWorkerPool, {
      feedContextIdentifier,
      addToTotalItemsQueuedForValidation(addition) {
        feedContext.totalItemsQueuedForValidation += addition;
      },
    });

    const onFeedEnd = async () => {
      await setFeedIsUpToDate(validatorWorkerPool, feedContextIdentifier, {
        multibar: state.multibar,
      });
    };

    if (isParentFeed[dataDownload.additionalType] === true) {
      log(`Found parent opportunity feed: ${dataDownload.contentUrl}`);
      state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
      const ingestParentOpportunityPageForThisFeed = partialRight(ingestParentOpportunityPage, sendItemsToValidatorWorkerPoolForThisFeed);
      harvesters.push(
        harvestRPDE({
          baseUrl: dataDownload.contentUrl,
          feedContextIdentifier,
          headers: withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
          processPage: ingestParentOpportunityPageForThisFeed,
          onFeedEnd,
          isOrdersFeed: false,
          state: {
            context: feedContext, feedContextMap: state.feedContextMap, incompleteFeeds: state.incompleteFeeds, startTime: state.startTime,
          },
          loggingFns: {
            log, logError, logErrorDuringHarvest,
          },
          config: {
            WAIT_FOR_HARVEST, VALIDATE_ONLY, VERBOSE, ORDER_PROPOSALS_FEED_IDENTIFIER, REQUEST_LOGGING_ENABLED,
          },
          options: {
            multibar: state.multibar, pauseResume: state.pauseResume,
          },
        }),
      );
    } else if (isParentFeed[dataDownload.additionalType] === false) {
      log(`Found opportunity feed: ${dataDownload.contentUrl}`);
      state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
      const ingestOpportunityPageForThisFeed = partialRight(ingestOpportunityPage, sendItemsToValidatorWorkerPoolForThisFeed);

      harvesters.push(
        harvestRPDE({
          baseUrl: dataDownload.contentUrl,
          feedContextIdentifier,
          headers: withOpportunityRpdeHeaders(async () => OPPORTUNITY_FEED_REQUEST_HEADERS),
          processPage: ingestOpportunityPageForThisFeed,
          onFeedEnd,
          isOrdersFeed: false,
          state: {
            context: feedContext, feedContextMap: state.feedContextMap, incompleteFeeds: state.incompleteFeeds, startTime: state.startTime,
          },
          loggingFns: {
            log, logError, logErrorDuringHarvest,
          },
          config: {
            WAIT_FOR_HARVEST, VALIDATE_ONLY, VERBOSE, ORDER_PROPOSALS_FEED_IDENTIFIER, REQUEST_LOGGING_ENABLED,
          },
          options: {
            multibar: state.multibar, pauseResume: state.pauseResume,
          },
        }),
      );
    } else {
      logError(`\nERROR: Found unsupported feed in dataset site "${dataDownload.contentUrl}" with additionalType "${dataDownload.additionalType}"`);
      logError(`Only the following additionalType values are supported: \n${Object.keys(isParentFeed).map((x) => `- "${x}"`).join('\n')}'`);
    }
  });

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
      const onFeedEnd = async () => {
        OrderUuidTracking.doTrackEndOfFeed(state.orderUuidTracking, type, feedBookingPartnerIdentifier);
        await setFeedIsUpToDate(validatorWorkerPool, feedContextIdentifier, {
          multibar: state.multibar,
        });
      };

      state.incompleteFeeds.markFeedHarvestStarted(feedContextIdentifier);
      harvesters.push(
        harvestRPDE({
          baseUrl: feedUrl,
          feedContextIdentifier,
          headers: withOrdersRpdeHeaders(getOrdersFeedHeader(feedBookingPartnerIdentifier)),
          processPage: monitorOrdersPage(type, feedBookingPartnerIdentifier),
          onFeedEnd,
          isOrdersFeed: true,
          state: {
            feedContextMap: state.feedContextMap, incompleteFeeds: state.incompleteFeeds, startTime: state.startTime,
          },
          loggingFns: {
            log, logError, logErrorDuringHarvest,
          },
          config: {
            WAIT_FOR_HARVEST, VALIDATE_ONLY, VERBOSE, ORDER_PROPOSALS_FEED_IDENTIFIER, REQUEST_LOGGING_ENABLED,
          },
          options: {
            multibar: state.multibar, pauseResume: state.pauseResume,
          },
        }),
      );
    }
  }

  // Finished processing dataset site
  if (WAIT_FOR_HARVEST) log('\nBlocking integration tests to wait for harvest completion...');
  await setFeedIsUpToDate(validatorWorkerPool, 'DatasetSite', {
    multibar: state.multibar,
  });

  // Wait until all harvesters error catastrophically before existing
  await Promise.all(harvesters);
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
 * @param {import('@openactive/harvesting-utils/models/FeedContext').FeedContext} context
 * @param {number} numItems
 */
function onValidateItems(context, numItems) {
  context.validatedItems += numItems;
  if (context._progressbar) {
    context._progressbar.setTotal(context.totalItemsQueuedForValidation);
    if (context.totalItemsQueuedForValidation - context.validatedItems === 0) {
      context._progressbar.update(context.validatedItems, {
        ...progressFromContext(context),
        status: 'Validation Complete',
      });
      context._progressbar.stop();
    } else {
      context._progressbar.update(context.validatedItems, progressFromContext(context));
    }
  }
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
