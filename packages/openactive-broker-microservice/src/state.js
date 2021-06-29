const { OpenActiveTestAuthKeyManager } = require('@openactive/openactive-openid-test-client');
const config = require('config');
const PauseResume = require('./util/pause-resume');
const { OpportunityIdCache } = require('./util/opportunity-id-cache');
const { log } = require('./util/log');
const { MICROSERVICE_BASE_URL } = require('./apiConfig');

/**
 * @typedef {import('./models/FeedContext').FeedContext} FeedContext
 * @typedef {import('./validator/async-validator')} AsyncValidatorWorker
 */
/**
 * @typedef {object} PendingResponse
 * @property {(json: any) => void} send
 * @property {() => void} cancel
 */

const state = {
  // MISC
  startTime: new Date(),
  pauseResume: new PauseResume(),
  // AUTH
  globalAuthKeyManager: new OpenActiveTestAuthKeyManager(log, MICROSERVICE_BASE_URL, config.get('sellers'), config.get('broker.bookingPartners')),
  // DATASET
  datasetSiteJson: {},
  // TEST DATASETS
  /**
   * For each Test Dataset, a set of IDs of Opportunities which have been randomly generated for this Test Dataset.
   *
   * @type {Map<string, Set<string>>}
   */
  testDatasets: new Map(),
  // HARVESTING
  /**
   * Harvesting state for each RPDE feed.
   *
   * Key = Either:
   *   - `OrdersFeed (auth:${bookingPartnerIdentifier})` - the Orders feed for a given Booking Partner (e.g. `primary`)
   *   - 'OrderProposalsFeed (auth:${bookingPartnerIdentifier})' - the OrderProposalsFeed for a given Booking Partner (e.g. `primary`)
   *   - 'ScheduledSession'|'SessionSeries'|'FacilityUseSlot'|..etc - one of the Opportunity feeds.
   *
   * @type {Map<string, FeedContext>}
   */
  feedContextMap: new Map(),
  /**
   * List of Feed identifiers which have not yet completed harvesting.
   *
   * @type {string[]}
   */
  incompleteFeeds: [],
  // API RESPONSES
  /**
   * Call `.send()` on one of these reponses in order to respond to an as-yet unanswered request to get an Opportunity
   * with a given ID.
   *
   * @type {{ [opportunityId: string]: PendingResponse }}
   */
  pendingGetOpportunityResponses: {},
  /**
   * Maps Order UUIDs to a "Listener" object, which can be used to return an API response to the client which is
   * requesting this Order UUID.
   *
   * @typedef {{
   *   item: any,
   *   collectRes: import('express').Response | null,
   * }} Listener
   *
   * @type {Map<string, Listener>}
   */
  orderUuidListeners: new Map(),
  // VALIDATION
  /**
   * Workers which perform the validation. Validation is quite expensive, so we do it with a parallel work queue.
   *
   * @type {AsyncValidatorWorker[]}
   */
  validatorThreadArray: [],
  /**
   * Results of opportunity validation. These are stored so that they can all be rendered to a page if there are any
   * errors.
   *
   * @type {Map<string, any>}
   */
  validationResults: new Map(),
  // OPPORTUNITY DATA CACHES
  opportunityIdCache: OpportunityIdCache.create(),
  // nSQL joins appear to be slow, even with indexes. This is an optimisation pending further investigation
  parentOpportunityMap: new Map(),
  parentOpportunityRpdeMap: new Map(),
  opportunityMap: new Map(),
  opportunityRpdeMap: new Map(),
  rowStoreMap: new Map(),
  parentIdIndex: new Map(),
  // UI
  // create new progress bar container
  multibar: null,
  // HEALTH CHECKS
  /**
   * Express responses for /health-check requests which have not yet been delivered and will be sent when the feed
   * is fully harvested.
   *
   * @type {import('express').Response[]}
   */
  healthCheckResponsesWaitingForHarvest: [],
};

/**
 * @param {string} testDatasetIdentifier
 */
function getTestDataset(testDatasetIdentifier) {
  if (!state.testDatasets.has(testDatasetIdentifier)) {
    state.testDatasets.set(testDatasetIdentifier, new Set());
  }
  return state.testDatasets.get(testDatasetIdentifier);
}

function getAllDatasets() {
  return new Set(Array.from(state.testDatasets.values()).flatMap((x) => Array.from(x.values())));
}

/**
 * @param {string} feedIdentifier
 */
function addFeed(feedIdentifier) {
  state.incompleteFeeds.push(feedIdentifier);
}

module.exports = {
  state,
  getTestDataset,
  getAllDatasets,
  addFeed,
};
