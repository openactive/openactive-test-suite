const { OpenActiveTestAuthKeyManager } = require('@openactive/openactive-openid-client');
const config = require('config');
const { TwoPhaseListeners: Listeners } = require('./twoPhaseListeners/twoPhaseListeners');
const PauseResume = require('./util/pause-resume');
const { CriteriaOrientedOpportunityIdCache } = require('./util/criteria-oriented-opportunity-id-cache');
const { log } = require('./util/log');
const { MICROSERVICE_BASE_URL } = require('./broker-config');
const { OrderUuidTracking } = require('./order-uuid-tracking/order-uuid-tracking');
const { OnePhaseListeners } = require('./onePhaseListeners');
const { IncompleteFeeds } = require('./incomplete-feeds');
const path = require('path');
const fs = require('fs');
/**
 * @typedef {import('./validator/validator-worker-pool').ValidatorWorkerPoolType} ValidatorWorkerPoolType
 * @typedef {import('@openactive/harvesting-utils').FeedContext} FeedContext
 */
/**
 * @typedef {object} PendingResponse
 * @property {(json: any) => void} send
 * @property {() => void} cancel
 */

/**
 * Broker's internal state.
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
   * For each Test Dataset, a set of IDs of Opportunities which are now
   * considered "locked" because they have already been used in a test.
   *
   * @type {Map<string, Set<string>>}
   */
  lockedOpportunityIdsByTestDataset: new Map(),
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
  incompleteFeeds: new IncompleteFeeds(),
  // API RESPONSES
  /**
   * Maps Listener ID => a "Listener" object, which can be used to return an API response to the client
   * which is listening for this item.
   *
   * These are called 2-phase listeners because the listening and collection happen as two separate API calls (a POST
   * to set up the listener and a GET to retrieve the found item).
   *
   * When Broker gets a request to listen for a particular Opportunity or Order, it creates a "Listener" object,
   * which can later be used to return an API response to the client which is listening for this item.
   *
   * A "Listener ID" takes either of the forms:
   *
   * - `opportunities::{opportunityID}`
   * - `orders::{bookingPartnerIdentifier}::{orderUuid}` e.g. `orders::primary::4324d932-a326-4cc7-bcc0-05fb491744c7`
   * - `order-proposals::{bookingPartnerIdentifier}::{orderUuid}`
   */
  twoPhaseListeners: {
    /**
     * Maps `{type}::{bookingPartnerIdentifier}::{orderUuid}` to a "Listener" where `type` is one of `orders` or
     * `order-proposals`.
     *
     * e.g. `Map { 'orders::primary::4324d932-a326-4cc7-bcc0-05fb491744c7' => { item: ... }, ... }`
     */
    byOrderUuid: Listeners.createListenersMap(),
    /**
     * Maps Opportunity ID to a "Listener"
     */
    byOpportunityId: Listeners.createListenersMap(),
  },
  /**
   * These are called 1-phase listeners because the listening and collection happen as one API call.
   *
   * Otherwise, though, it is very similar to the twoPhaseListeners. A "Listener" is set up to listen for a particular
   * item (e.g. an Opportunity), and an HTTP response is triggered if the item is found.
   */
  onePhaseListeners: {
    /**
     * One-phase Listeners for Opportunities.
     * - Listener ID: Opportunity ID
     * - Item: Opportunity RPDE Item (e.g. `{ data: { '@type': 'Slot', ...} }`)
     */
    opportunity: new OnePhaseListeners(),
  },
  orderUuidTracking: OrderUuidTracking.createState(),
  // VALIDATOR
  /** @type {ValidatorWorkerPoolType} */
  _validatorWorkerPool: null,
  // OPPORTUNITY DATA CACHES
  // We use multiple strategies to cache opportunity data for different use cases.
  /* TODO investigate consolidation of opportunityItemRowCache and
  opportunityCache to reduce memory usage & simplify code:
  https://github.com/openactive/openactive-test-suite/issues/669 */
  /**
   * A criteria-oriented cache for opportunity data. Used to get criteria-matching
   * opportunities for tests.
   */
  criteriaOrientedOpportunityIdCache: CriteriaOrientedOpportunityIdCache.create(),
  /**
   * The "row" cache stores OpportunityItemRows. These objects contain data
   * about the underlying Opportunity as well as the RPDE item that it came
   * from.
   *
   * The keys are the JSON-LD IDs of the Opportunities (i.e. .data['@id']).
   *
   * This cache is used to:
   * - Determine which Opportunities are "orphans"
   * - Determine which child Opportunities to re-process when a parent
   *   Opportunity is updated.
   */
  opportunityItemRowCache: {
    /**
     * Map { [jsonLdId] => opportunityItemRow }
     *
     * @type {Map<string, import('./models/core').OpportunityItemRow>}
     */
    store: new Map(),
    /**
     * Maps each parent Opportunity ID to a set of the IDs of its children.
     *
     * @type {Map<string, Set<string>>}
     */
    parentIdIndex: new Map(),
  },
  /**
   * The opportunity cache stores Opportunities found in the feeds.
   *
   * This cache is used to:
   * - Respond to opportunity listeners
   * - For express routes which render opportunities found in the feed
   * - To combine child/parent opportunity and, from there, determine which
   *   criteria the duo match and so where to store them in the
   *   criteria-oriented cache.
   *
   * This cache used to use nSQL, but this turned out to be slow, even with
   * indexes. It's current form is an optimisation pending further
   * investigation.
   */
  opportunityCache: {
    /**
     * Map { [jsonLdId] => opportunityData }
     *
     * For parent opportunities (e.g. FacilityUse) only.
     *
     * @type {Map<string, Record<string, unknown>>}
     */
    parentMap: new Map(),
    /**
     *
     * For child opportunities (e.g. FacilityUseSlot) only.
     *
     */
    childMap: {
      set: (childId, childData) => {
        const childFile = path.join(__dirname, '..', 'data',`${encodeURIComponent(childId)}.json`);
        fs.writeFile(childFile, JSON.stringify(childData, null, 2), (err) => {
          if (err) {
            console.error(err);
          }
        });
      },
      get: (childId) => {
        const childFile = path.join(__dirname, '..', 'data',`${encodeURIComponent(childId)}.json`);
        const childData = fs.readFile(childFile, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return null;
          }
          return JSON.parse(data);
        });
        return childData;
      },
      delete: (childId) => {
        const childFile = path.join(__dirname, '..', 'data',`${encodeURIComponent(childId)}.json`);
        fs.unlink(childFile, (err) => {
          if (err) {
            console.error(err);
          }
        });
      },
      size: () => {
        const childDir = path.join(__dirname, '..', 'data');
        const childFiles = fs.readdirSync(childDir);
        return childFiles.length;
      },
      clear: () => {
        const childDir = path.join(__dirname, '..', 'data');
        fs.rmdirSync(childDir, { recursive: true });
      },
      init: () => {
        const childDir = path.join(__dirname, '..', 'data');
        fs.mkdirSync(childDir, { recursive: true });
      },
    },
  },
  /**
   * Stores mappings between IDs which allow Broker to perform various kinds of
   * housekeeping to ensure that its stored opportunity date is correct.
   */
  opportunityHousekeepingCaches: {
    /**
     * Map { [rpdeFeedItemIdentifier] => jsonLdId }
     *
     * This allows us to look up the JSON-LD ID of a deleted item in the feed,
     * as deleted items do not contain the JSON-LD ID.
     *
     * For parent opportunities (e.g. FacilityUse) only.
     *
     * @type {Map<string, string>}
     */
    parentOpportunityRpdeMap: new Map(),
    /**
     * Map { [jsonLdId] => subEventIds }
     *
     * Associates a parent opportunity (jsonLdId) with a list of its child
     * Opportunity IDs.
     *
     * This allows us to delete `.subEvent` Opportunities when they are no
     * longer present in the parent Opportunity's data.
     *
     * @type {Map<string, string[]>}
     */
    parentOpportunitySubEventMap: new Map(),
    /**
     * Map { [rpdeFeedItemIdentifier] => jsonLdId }
     *
     * This allows us to look up the JSON-LD ID of a deleted item in the feed,
     * as deleted items do not contain the JSON-LD ID.
     *
     * For child opportunities (e.g. FacilityUseSlot) only.
     *
     * @type {Map<string, string>}
     */
    opportunityRpdeMap: new Map(),
  },

  // Array of deleted parent and child IDs
  deletedIds: {
    parent: {},
    child: {},
  },

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
 * @param {ValidatorWorkerPoolType} validatorWorkerPool
 */
function setGlobalValidatorWorkerPool(validatorWorkerPool) {
  state._validatorWorkerPool = validatorWorkerPool;
}

function getGlobalValidatorWorkerPool() {
  return state._validatorWorkerPool;
}

/**
 * @typedef {typeof state} State
 */

module.exports = {
  state,
  setGlobalValidatorWorkerPool,
  getGlobalValidatorWorkerPool,
};
