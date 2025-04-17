/*

What are the "get" use cases for the criteria cache?

- getStatusRoute() - .buckets - for users
- assertOpportunityCriteriaNotFound() - assert that for a given
  criteria/flow/type, there are no matching opps - for tests
- getRandomBookableOpportunity()
  - get a random opp which matches the criteria/flow/type/seller.
  - If this endpoint fails, provide a summary of failed constraints

hasCriteriaAnyMatches(criteria, flow, type) {

SELECT 1
FROM criteria_cache
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type

}

getCriteriaMatches(criteria, flow, type, seller) {

SELECT opportunity_id
FROM criteria_cache
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type
  AND seller_id = :seller

}

The other thing needs this:

availableSellers: { seller1: 3, seller2: 8, ... }
criteriaErrors: { constraint1: 2, constraint2: 1, ... }

Bugs currently:

- If a opp fails and gets an update (and still fails), criteriaErrors increments
- If an opp once passed and now fails, criteriaErrors is not updated

# Table idea 1:

- Criteria Type
  - Criteria Name
  - Booking Flow
  - Opportunity Type
  - (idx all 3)
- Cri-Opp Mapping
  - Seller ID (idx)
  - Criteria Type ID
  - Opportunity ID
- Criteria Errors
  - Criteria Type ID
  - Failed Constraint Name
  - Amount

hasCriteriaAnyMatches(criteria, flow, type) {

SELECT 1
FROM
  criteria_type
  INNER JOIN cri_opp_mapping ON criteria_type.id = cri_opp_mapping.criteria_type_id
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type

}

getCriteriaMatches(criteria, flow, type, seller) {

SELECT opportunity_id
FROM
  criteria_type
  INNER JOIN cri_opp_mapping ON criteria_type.id = cri_opp_mapping.criteria_type_id
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type
  AND seller_id = :seller

}

getCriteriaAllSellerMatchAmounts(criteria, flow, type) {

SELECT
  seller_id,
  COUNT(*) AS match_amount
FROM
  criteria_type
  INNER JOIN cri_opp_mapping ON criteria_type.id = cri_opp_mapping.criteria_type_id
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type
GROUP BY seller_id

}

getCriteriaErrors(criteria, flow, type) {

SELECT
  failed_constraint_name,
  COUNT(*) AS error_amount
FROM
  criteria_errors
  INNER JOIN cri_opp_mapping ON criteria_errors.criteria_type_id = cri_opp_mapping.criteria_type_id
WHERE
  criteria_name = :criteria
  AND booking_flow = :flow
  AND opportunity_type = :type
GROUP BY failed_constraint_name

}

*/
const { criteria: allCriteria } = require('@openactive/test-interface-criteria');
const knex = require('knex');
const { omit } = require('lodash');
// const { CriteriaOrientedOpportunityIdCache } = require('./criteria-oriented-opportunity-id-cache');
// const { mapToObjectSummary } = require('./map-to-object-summary');

/**
 * @typedef {import('../models/core').OpportunityItemRow} OpportunityItemRow
 */
/**
 * @typedef {Record<string, unknown>} OpportunityCacheItem
 * @typedef {Omit<
 *   OpportunityItemRow,
 *   | 'feedModified'
 *   | 'waitingForParentToBeIngested'
 *   | 'isParent'
 * >} DbOpportunityItemRow
 * @typedef {{
   *   [criteriaName: string]: {
   *     [bookingFlow: string]: {
   *       [opportunityType: string]: {
   *         contents: {
   *           [sellerId: string]: number;
   *         };
   *         criteriaErrors: {
   *           [constraintName: string]: number;
   *         };
   *       };
   *     };
   *   };
   * }} CriteriaOrientedOpportunityIdCacheSummary
 */

const ALL_BOOKING_FLOWS = [
  'OpenBookingSimpleFlow',
  'OpenBookingApprovalFlow',
];
const ALL_OPPORTUNITY_TYPES = [
  'ScheduledSession',
  'FacilityUseSlot',
  'IndividualFacilityUseSlot',
  'CourseInstance',
  'HeadlineEvent',
  'Event',
  'HeadlineEventSubEvent',
  'CourseInstanceSubEvent',
  'OnDemandEvent',
];

/**
 * Manages Broker Microservice data that scales with feed size, so contains
 * caches of opportunity data.
 *
 * As feeds can be very large, caches which contain all feed data need to (at
 * least optionally) be persisted to something other than memory.
 *
 * So this class is an abstraction over the persistence layer.
 *
 * Note that all get- functions return readonly data to ensure that client code
 * does not attempt to mutate it, as this likely means that it is under the
 * misinterpretation that this will update the data itself (as if it was
 * in-memory).
 */
class PersistentStore {
  constructor(sqliteFilename = ':memory:') {
    this._sqliteFilename = sqliteFilename;
    /** @type {import('knex').Knex} */
    this._db = createKnexConnection(this._sqliteFilename);

    // /**
    //  * A criteria-oriented cache for opportunity data. Used to get criteria-matching
    //  * opportunities for tests.
    //  */
    // this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

    // /**
    //  * Stores mappings between IDs which allow Broker to perform various kinds of
    //  * housekeeping to ensure that its stored opportunity date is correct.
    //  */
    // this._opportunityHousekeepingCaches = {
    //   /**
    //    * Map { [jsonLdId] => subEventIds }
    //    *
    //    * Associates a parent opportunity (jsonLdId) with a list of its child
    //    * Opportunity IDs.
    //    *
    //    * This allows us to delete `.subEvent` Opportunities when they are no
    //    * longer present in the parent Opportunity's data.
    //    *
    //    * @type {Map<string, string[]>}
    //    */
    //   parentOpportunitySubEventMap: new Map(),
    //   /**
    //    * Map { [rpdeFeedItemIdentifier] => jsonLdId }
    //    *
    //    * This allows us to look up the JSON-LD ID of a deleted item in the feed,
    //    * as deleted items do not contain the JSON-LD ID.
    //    *
    //    * @type {Map<string, string>}
    //    */
    //   rpdeMap: new Map(),
    // };
    // /**
    //  * The "row" cache stores OpportunityItemRows. These objects contain data
    //  * about the underlying Opportunity as well as the RPDE item that it came
    //  * from.
    //  *
    //  * The keys are the JSON-LD IDs of the Opportunities (i.e. .data['@id']).
    //  *
    //  * This cache is used to:
    //  * - Determine which Opportunities are "orphans"
    //  * - Determine which child Opportunities to re-process when a parent
    //  *   Opportunity is updated.
    //  */
    // this._opportunityItemRowCache = {
    //   /**
    //    * Map { [jsonLdId] => opportunityItemRow }
    //    *
    //    * @type {Map<string, import('../models/core').OpportunityItemRow>}
    //    */
    //   store: new Map(),
    //   /**
    //    * Maps each parent Opportunity ID to a set of the IDs of its children.
    //    *
    //    * @type {Map<string, Set<string>>}
    //    */
    //   parentIdIndex: new Map(),
    // };
  }

  async init() {
    await this._createSqliteTables();
    // If running SQLite on a file, then tables may need to be cleared of data
    // from a previous run
    await this.clearCaches();
    await this.prePropulateDb();
  }

  // TODO2 make sure this is called in Broker at exit points
  async stop() {
    await this._db.destroy();
  }

  // TODO2 doc each table with cache docs from constructor
  async _createSqliteTables() {
    // PRAGMA foreign_keys = ON;
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS opportunity_cache (
        json_ld_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT,
        feed_modified TEXT NOT NULL,
        is_parent BOOLEAN NOT NULL,
        waiting_for_parent_to_be_ingested BOOLEAN NOT NULL,
        opportunity_item_row TEXT NOT NULL
      ) WITHOUT ROWID
    `);
    await this._db.raw(`
      CREATE INDEX IF NOT EXISTS opportunity_cache_parent_json_ld_id_idx
      ON opportunity_cache (parent_json_ld_id)
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS criteria_type (
        id INTEGER PRIMARY KEY ASC,
        criteria_name TEXT NOT NULL,
        booking_flow TEXT NOT NULL,
        opportunity_type TEXT NOT NULL,

        UNIQUE (criteria_name, booking_flow, opportunity_type)
      )
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS criteria_type_opportunity_mapping (
        id INTEGER PRIMARY KEY ASC,
        criteria_type_id INTEGER NOT NULL,
        seller_id TEXT NOT NULL,
        opportunity_id TEXT NOT NULL,

        FOREIGN KEY (criteria_type_id) REFERENCES criteria_type(id) ON DELETE CASCADE,
        FOREIGN KEY (opportunity_id) REFERENCES opportunity_cache(json_ld_id) ON DELETE CASCADE,

        UNIQUE (criteria_type_id, seller_id, opportunity_id)
      )
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS criteria_errors (
        id INTEGER PRIMARY KEY ASC,
        criteria_type_id INTEGER NOT NULL,
        failed_constraint_name TEXT NOT NULL,
        amount INTEGER NOT NULL,

        FOREIGN KEY (criteria_type_id) REFERENCES criteria_type(id) ON DELETE CASCADE,

        UNIQUE (criteria_type_id, failed_constraint_name)
      )
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS opportunity_housekeeping_parent_opportunity_sub_event_map (
        sub_event_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT NOT NULL,

        FOREIGN KEY (parent_json_ld_id) REFERENCES opportunity_cache(json_ld_id) ON DELETE CASCADE,
        FOREIGN KEY (sub_event_id) REFERENCES opportunity_cache(json_ld_id) ON DELETE CASCADE
      ) WITHOUT ROWID;
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS opportunity_housekeeping_opportunity_rpde_map (
        rpde_feed_item_identifier TEXT PRIMARY KEY,
        json_ld_id TEXT NOT NULL,

        FOREIGN KEY (json_ld_id) REFERENCES opportunity_cache(json_ld_id) ON DELETE CASCADE
      ) WITHOUT ROWID;
    `);
  }

  async clearCaches() {
    // this._opportunityHousekeepingCaches.rpdeMap.clear();
    // this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.clear();
    // this._opportunityItemRowCache.store.clear();
    // this._opportunityItemRowCache.parentIdIndex.clear();
    // this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

    await this._db('criteria_errors').delete();
    await this._db('criteria_type_opportunity_mapping').delete();
    await this._db('criteria_type').delete();
    await this._db('opportunity_housekeeping_parent_opportunity_sub_event_map').delete();
    await this._db('opportunity_housekeeping_opportunity_rpde_map').delete();
    await this._db('opportunity_cache').delete();
  }

  async prePropulateDb() {
    const criteriaTypeRows = allCriteria.flatMap((criteria) => (
      ALL_BOOKING_FLOWS.flatMap((bookingFlow) => (
        ALL_OPPORTUNITY_TYPES.map((opportunityType) => (
          {
            criteria_name: criteria.name,
            booking_flow: bookingFlow,
            opportunity_type: opportunityType,
          }
        ))
      ))));
    // Insert in batches so that we don't hit the insert limit (there're 700+ rows)
    const batchSize = 50;
    for (let i = 0; i < criteriaTypeRows.length; i += batchSize) {
      const rows = criteriaTypeRows.slice(i, i + batchSize);
      await this._db('criteria_type').insert(rows);
    }
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<Readonly<import('../models/core').OpportunityItemRow> | undefined>}
   */
  async getOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.get(jsonLdId);
    const result = await this._db('opportunity_cache')
      .select('opportunity_item_row', 'feed_modified', 'waiting_for_parent_to_be_ingested', 'is_parent')
      .where('json_ld_id', jsonLdId)
      .first();
    if (!result) {
      return undefined;
    }
    return convertDbOpportunityItemRowToOpportunityItemRow(
      result.opportunity_item_row,
      result.feed_modified,
      result.waiting_for_parent_to_be_ingested,
      result.is_parent,
    );
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<boolean>}
   */
  async hasOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.has(jsonLdId);
    const result = await this._db('opportunity_cache')
      .select(this._db.raw('1'))
      .where('json_ld_id', jsonLdId)
      .first();

    return !!result;
  }

  /**
   * Store (insert or replace) an opportunity in the opportunity cache.
   *
   * This also saves an internal mapping between the feedItemIdentifier and
   * jsonLdId, which is used for RPDE deletes.
   *
   * @param {import('../models/core').OpportunityItemRow} itemRow
   * @param {string | undefined} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   *   If not set, then an RPDE mapping will not be made, which means that it
   *   will not be possible to process an RPDE delete for this item. Therefore
   *   it should only be set for an item that didn't directly come from the feed
   *   like a .subEvent-derived item.
   */
  async storeOpportunityItemRow(itemRow, feedItemIdentifier) {
    // // If it has a parent, associate it with its parent
    // if (itemRow.jsonLdParentId != null) {
    //   if (!this._opportunityItemRowCache.parentIdIndex.has(itemRow.jsonLdParentId)) {
    //     this._opportunityItemRowCache.parentIdIndex.set(itemRow.jsonLdParentId, new Set());
    //   }
    //   this._opportunityItemRowCache.parentIdIndex.get(itemRow.jsonLdParentId).add(itemRow.jsonLdId);
    // }

    // this._opportunityItemRowCache.store.set(itemRow.jsonLdId, itemRow);
    // if (feedItemIdentifier) {
    //   this._opportunityHousekeepingCaches.rpdeMap.set(feedItemIdentifier, itemRow.jsonLdId);
    // }

    const dbItemRow = omit(itemRow, 'feedModified', 'waitingForParentToBeIngested', 'isParent');
    // Insert or update the opportunity item row
    await this._db('opportunity_cache')
      .insert({
        json_ld_id: itemRow.jsonLdId,
        parent_json_ld_id: itemRow.jsonLdParentId,
        is_parent: itemRow.isParent,
        feed_modified: itemRow.feedModified,
        waiting_for_parent_to_be_ingested: itemRow.waitingForParentToBeIngested,
        opportunity_item_row: JSON.stringify(dbItemRow),
      })
      .onConflict('json_ld_id')
      .merge(['parent_json_ld_id', 'is_parent', 'feed_modified', 'waiting_for_parent_to_be_ingested', 'opportunity_item_row']);

    // If there is a feedItemIdentifier, then cache the mapping between it and
    // the jsonLdId so that it can be used to process RPDE deletes.
    if (feedItemIdentifier) {
      await this._db('opportunity_housekeeping_opportunity_rpde_map')
        .insert({
          rpde_feed_item_identifier: feedItemIdentifier,
          json_ld_id: itemRow.jsonLdId,
        })
        .onConflict('rpde_feed_item_identifier')
        .merge({
          json_ld_id: itemRow.jsonLdId,
        });
    }
  }

  /**
   * Delete a parent (e.g. FacilityUse or SessionSeries) opportunity from the
   * opportunity row item cache.
   *
   * This also updates internal housekeeping caches.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   */
  async deleteParentOpportunityItemRow(feedItemIdentifier) {
    // const jsonLdId = this._opportunityHousekeepingCaches.rpdeMap.get(feedItemIdentifier);

    // // If we had subEvents for this item, then we must be sure to delete the associated opportunityItems
    // // that were made for them:
    // if (this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
    //   for (const subEventId of this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
    //     this._deleteOpportunityItemRowCacheChildItem(subEventId);
    //   }
    // }

    // this._opportunityHousekeepingCaches.rpdeMap.delete(feedItemIdentifier);
    // this._opportunityItemRowCache.store.delete(jsonLdId);
    // this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.delete(jsonLdId);
    const jsonLdId = await this._getJsonLdIdFromFeedItemIdentifier(feedItemIdentifier);

    // Delete all subEvent child opportunities associated with this parent
    await this._db('opportunity_cache')
      .whereIn('json_ld_id', function () {
        this.select('sub_event_id')
          .from('opportunity_housekeeping_parent_opportunity_sub_event_map')
          .where('parent_json_ld_id', jsonLdId);
      })
      .delete();

    // TODO optimise: by getting jsonLdId in a sub-query
    // This will also delete related rows from other tables via delete cascades.
    if (jsonLdId) {
      // This will also delete related rows from other tables via delete cascades.
      await this._db('opportunity_cache')
        .where('json_ld_id', jsonLdId)
        .delete();
    }
  }

  /**
   * Delete a child (e.g. Slot or ScheduledSession) opportunity from the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches and the row cache.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   */
  async deleteChildOpportunityItemRow(feedItemIdentifier) {
    // const jsonLdId = this._opportunityHousekeepingCaches.rpdeMap.get(feedItemIdentifier);
    // this._opportunityHousekeepingCaches.rpdeMap.delete(feedItemIdentifier);

    // this._deleteOpportunityItemRowCacheChildItem(jsonLdId);
    const jsonLdId = await this._getJsonLdIdFromFeedItemIdentifier(feedItemIdentifier);

    // TODO optimise: by getting jsonLdId in a sub-query
    // This will also delete related rows from other tables via delete cascades.
    if (jsonLdId) {
      // This will also delete related rows from other tables via delete cascades.
      await this._db('opportunity_cache')
        .where('json_ld_id', jsonLdId)
        .delete();
    }
  }

  /**
   * @param {string} feedItemIdentifier
   * @returns {Promise<string | undefined>}
   */
  async _getJsonLdIdFromFeedItemIdentifier(feedItemIdentifier) {
    const result = await this._db('opportunity_housekeeping_opportunity_rpde_map')
      .select('json_ld_id')
      .where('rpde_feed_item_identifier', feedItemIdentifier)
      .first();

    return result ? result.json_ld_id : undefined;
  }

  /**
   * Call this when there is (potentially) an update to a parent Opportunity's
   * `subEvent` (e.g. A SessionSeries feed which contains ScheduledSessions
   * within `.subEvent` rather than as a separate ScheduledSessions feed).
   *
   * It compares the current list of subEvents with the previous list and
   * determines if anything has been added or deleted.
   *
   * As the subEvents don't have their own individual "state" fields showing
   * whether or not they are "updated" or "deleted", we have to infer this from
   * whether or not they were present when this item was last encountered. In
   * order to do so, we keep a list of the subEvent IDs mapped to the jsonLdId
   * of the containing item in "parentOpportunitySubEventMap". If an old
   * subEvent is not present in the list of new subEvents, then it has been
   * deleted and so we remove the associated opportunityItem data. If a new
   * subEvent is not present in the list of old subEvents, then we record its ID
   * in the list for the next time this check is done.
   *
   * @param {{'@id'?: string, id?:string}[]} parentSubEvent
   * @param {string} parentJsonLdId
   */
  async reconcileParentSubEventChanges(parentSubEvent, parentJsonLdId) {
    // const oldSubEventIds = this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId);
    // const newSubEventIds = parentSubEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter((x) => x);

    // if (!oldSubEventIds) {
    //   if (newSubEventIds.length > 0) {
    //     this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.set(parentJsonLdId, newSubEventIds);
    //   }
    // } else {
    //   for (const subEventId of oldSubEventIds) {
    //     if (!newSubEventIds.includes(subEventId)) {
    //       this._deleteOpportunityItemRowCacheChildItem(subEventId);
    //       this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId).filter((x) => x !== subEventId);
    //     }
    //   }
    //   for (const subEventId of newSubEventIds) {
    //     if (!oldSubEventIds.includes(subEventId)) {
    //       this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId).push(subEventId);
    //     }
    //   }
    // }
    // Extract new subEvent IDs from the provided parent subEvent list
    const newSubEventIds = parentSubEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter(Boolean);

    // Get current subEvent IDs from the database
    const oldSubEventRows = await this._db('opportunity_housekeeping_parent_opportunity_sub_event_map')
      .select('sub_event_id')
      .where('parent_json_ld_id', parentJsonLdId);
    const oldSubEventIds = oldSubEventRows.map((row) => row.sub_event_id);

    // Find subEvents to delete (in old list but not in new list)
    const subEventIdsToDelete = oldSubEventIds.filter((id) => !newSubEventIds.includes(id));

    // Find subEvents to add (in new list but not in old list)
    const subEventIdsToAdd = newSubEventIds.filter((id) => !oldSubEventIds.includes(id));

    // Delete removed subEvents
    if (subEventIdsToDelete.length > 0) {
      // Delete the subEvents from the opportunity_cache table
      // This will cascade delete from other tables due to foreign key constraints
      await this._db('opportunity_cache')
        .whereIn('json_ld_id', subEventIdsToDelete)
        .delete();
    }

    // Add new subEvents
    if (subEventIdsToAdd.length > 0) {
      const rows = subEventIdsToAdd.map((subEventId) => ({
        sub_event_id: subEventId,
        parent_json_ld_id: parentJsonLdId,
      }));

      await this._db('opportunity_housekeeping_parent_opportunity_sub_event_map')
        .insert(rows)
        .onConflict(['sub_event_id'])
        .merge(['parent_json_ld_id']);
    }
  }

  /**
   * Mark a child opportunity (in the row cache) as having found its parent.
   *
   * It also returns the row (if there is one).
   *
   * @param {string} childJsonLdId
   * @param {string} newFeedModified
   * @returns {Promise<Readonly<import('../models/core').OpportunityItemRow> | undefined>}
   */
  async markOpportunityItemRowChildAsFoundParent(childJsonLdId, newFeedModified) {
    // const row = this._opportunityItemRowCache.store.get(childJsonLdId);
    // if (row) {
    //   row.feedModified = newFeedModified;
    //   row.waitingForParentToBeIngested = false;
    //   return row;
    // }
    // return undefined;
    const rows = await this._db('opportunity_cache')
      .where('json_ld_id', childJsonLdId)
      .returning(['opportunity_item_row', 'feed_modified', 'waiting_for_parent_to_be_ingested', 'is_parent'])
      .update({
        feed_modified: newFeedModified,
        waiting_for_parent_to_be_ingested: false,
      });
    if (!rows) {
      return undefined;
    }
    // knex's types do not work with `.returning`, thinking this should be a
    // number rather than an array of rows
    const row = /** @type {any} */(rows)[0];
    return convertDbOpportunityItemRowToOpportunityItemRow(
      row.opportunity_item_row,
      row.feed_modified,
      row.waiting_for_parent_to_be_ingested,
      row.is_parent,
    );
  }

  // /**
  //  * Delete a child (e.g. Slot or ScheduledSession) opportunity from the
  //  * opportunity item row cache.
  //  *
  //  * @param {string} jsonLdId
  //  */
  // _deleteOpportunityItemRowCacheChildItem(jsonLdId) {
  //   const row = this._opportunityItemRowCache.store.get(jsonLdId);
  //   if (row) {
  //     // Delete from its parent's index
  //     const idx = this._opportunityItemRowCache.parentIdIndex.get(row.jsonLdParentId);
  //     if (idx) {
  //       idx.delete(jsonLdId);
  //     }
  //     // Delete from the store
  //     this._opportunityItemRowCache.store.delete(jsonLdId);
  //   }
  // }

  /**
   * Get (JSON-LD) IDs of all opportunities which are children of the specified
   * parent, EXCEPT for those children which are derived from a .subEvent.
   *
   * @param {string} parentJsonLdId
   * @returns {Promise<Readonly<Set<string>>>}
   */
  async getOpportunityNonSubEventChildIdsFromParent(parentJsonLdId) {
    // if (!this._opportunityItemRowCache.parentIdIndex.has(parentJsonLdId)) {
    //   return new Set();
    // }
    // return this._opportunityItemRowCache.parentIdIndex.get(parentJsonLdId);
    const childRows = await this._db('opportunity_cache')
      .select('json_ld_id')
      .where('parent_json_ld_id', parentJsonLdId);

    if (!childRows || childRows.length === 0) {
      return new Set();
    }

    return new Set(childRows.map((row) => row.json_ld_id));
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   * @returns {Promise<boolean>}
   */
  async hasCriteriaAnyMatches(criteriaName, bookingFlow, opportunityType) {
    const result = await this._db('criteria_type')
      .innerJoin('criteria_type_opportunity_mapping', 'criteria_type.id', 'criteria_type_opportunity_mapping.criteria_type_id')
      .select(this._db.raw('1'))
      .where('criteria_name', criteriaName)
      .where('booking_flow', bookingFlow)
      .where('opportunity_type', opportunityType)
      .first();
    return !!result;
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   * @param {string} sellerId
   * @returns {Promise<Readonly<string[]>>} A list of Opportunity (JSON-LD) IDs
   *   which match the criteria.
   */
  async getCriteriaMatches(criteriaName, bookingFlow, opportunityType, sellerId) {
    const rows = await this._db('criteria_type')
      .innerJoin('criteria_type_opportunity_mapping', 'criteria_type.id', 'criteria_type_opportunity_mapping.criteria_type_id')
      .select('opportunity_id')
      .where('criteria_name', criteriaName)
      .where('booking_flow', bookingFlow)
      .where('opportunity_type', opportunityType)
      .where('seller_id', sellerId);
    return rows.map((row) => row.opportunity_id);
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   * @returns {Promise<Readonly<{[sellerId: string]: number}>>} For each seller
   *   ID, the number of opportunities which match the criteria.
   */
  async getCriteriaAllSellerMatchAmounts(criteriaName, bookingFlow, opportunityType) {
    const rows = await this._db('criteria_type')
      .innerJoin('criteria_type_opportunity_mapping', 'criteria_type.id', 'criteria_type_opportunity_mapping.criteria_type_id')
      .select('seller_id', this._db.raw('COUNT(*) as match_amount'))
      .where('criteria_name', criteriaName)
      .where('booking_flow', bookingFlow)
      .where('opportunity_type', opportunityType)
      .groupBy('seller_id');
    return rows.reduce((acc, row) => {
      acc[row.seller_id] = row.match_amount;
      return acc;
    }, {});
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   * @returns {Promise<Readonly<{[sellerId: string]: {[failedConstraintName: string]: number}}>>} For each seller
   *   ID, a map of failed constraint names to the number of opportunities which
   *   failed the constraint.
   */
  async getCriteriaErrors(criteriaName, bookingFlow, opportunityType) {
    const rows = await this._db('criteria_type')
      .innerJoin('criteria_errors', 'criteria_type.id', 'criteria_errors.criteria_type_id')
      .select('failed_constraint_name', 'amount')
      .where('criteria_name', criteriaName)
      .where('booking_flow', bookingFlow)
      .where('opportunity_type', opportunityType);
    return rows.reduce((acc, row) => {
      acc[row.failed_constraint_name] = row.amount;
      return acc;
    }, {});
  }

  /**
   * @param {string} opportunityId
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  async setOpportunityMatchesCriteria2(opportunityId, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    await this._db('criteria_type_opportunity_mapping').insert({
      criteria_type_id: this._db('criteria_type')
        .select('id')
        .where({
          criteria_name: criteriaName,
          booking_flow: bookingFlow,
          opportunity_type: opportunityType,
        })
        .first(),
      seller_id: sellerId,
      opportunity_id: opportunityId,
    })
      .onConflict(['criteria_type_id', 'seller_id', 'opportunity_id'])
      .ignore();
  }

  /**
   * @param {string} opportunityId
   * @param {string[]} unmetCriteriaDetails A list of constraint names which
   *   were not met by the opportunity.
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  async setOpportunityDoesNotMatchCriteria2(opportunityId, unmetCriteriaDetails, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    const criteriaTypeIdRow = await this._db('criteria_type')
      .select('id')
      .where({
        criteria_name: criteriaName,
        booking_flow: bookingFlow,
        opportunity_type: opportunityType,
      })
      .first();

    if (!criteriaTypeIdRow) {
      throw new Error(`Criteria type not found: ${criteriaName} ${bookingFlow} ${opportunityType}`);
    }
    const criteriaTypeId = criteriaTypeIdRow.id;

    // Delete the match if there was one previously
    await this._db('criteria_type_opportunity_mapping')
      .where({
        criteria_type_id: criteriaTypeId,
        seller_id: sellerId,
        opportunity_id: opportunityId,
      })
      .delete();

    // Insert the new errors
    const errorInsertRows = unmetCriteriaDetails.map((failedConstraintName) => ({
      criteria_type_id: criteriaTypeId,
      failed_constraint_name: failedConstraintName,
      amount: 1,
    }));
    const insertQuery = this._db('criteria_errors')
      .insert(errorInsertRows)
      .toSQL();
    // const insertQuery = this._db('criteria_errors')
    //   .insert(errorInsertRows)
    //   .onConflict(['criteria_type_id', 'failed_constraint_name'])
    //   .ignore();
    // knex doesn't support a custom updater like 'amount + 1' in an onConflict
    const rawQuery = `
      ${insertQuery.sql}
      ON CONFLICT (criteria_type_id, failed_constraint_name) DO UPDATE SET
        amount = amount + 1
    `;
    // console.log(rawQuery);
    // console.log(insertQuery.bindings);
    // process.exit(0);
    await this._db.raw(rawQuery, insertQuery.bindings);
    // await this._db('criteria_errors')
    //   .insert(errorInsertRows)
    //   .onConflict(['criteria_type_id', 'failed_constraint_name'])
    //   // TODO3 oh no how we do this?
    //   .merge([
    //     this._db.raw('amount = criteria_errors.amount + 1'),
    //   ]);
  }

  /**
   * @returns {Promise<Readonly<CriteriaOrientedOpportunityIdCacheSummary>>}
   */
  // eslint-disable-next-line class-methods-use-this
  async getCriteriaOrientedOpportunityIdCacheSummary() {
    throw new Error('getCriteriaOrientedOpportunityIdCacheSummary() is not implemented');
    // return /** @type {any} */ (mapToObjectSummary(this._criteriaOrientedOpportunityIdCache));
    // const rows = await this._db('criteria_oriented_opportunity_id_cache')
    //   .select(
    //     'criteria_name',
    //     'booking_flow',
    //     'opportunity_type',
    //     'seller_id',
    //     'failed_constraint_name'
    //   )
    //   .count('opportunity_id as num_matches')
    //   .groupBy(
    //     'criteria_name',
    //     'booking_flow',
    //     'opportunity_type',
    //     'seller_id',
    //     'failed_constraint_name',
    //   );
    // /** @type {CriteriaOrientedOpportunityIdCacheSummary} */
    // const result = {};
    // for (const row of rows) {
    //   const isCriteriaMatch = !row.failed_constraint_name;
    //   if (isCriteriaMatch) {
    //     set(result, [row.criteria_name, row.booking_flow, row.opportunity_type, row.seller_id, 'contents', row.opportunity_id], row.num_matches);
    //   } else {
    //     set(result, [row.criteria_name, row.booking_flow, row.opportunity_type, row.seller_id, 'criteriaErrors', row.failed_constraint_name], row.num_matches);
    //   }
    // }
    // return result;
  }

  // /**
  //  * @param {string} criteriaName
  //  * @param {string} bookingFlow
  //  * @param {string} opportunityType
  //  * @returns {Promise<Readonly<import('./criteria-oriented-opportunity-id-cache').OpportunityIdCacheTypeBucket>>}
  //  */
  // async getCriteriaOrientedOpportunityIdCacheTypeBucket(criteriaName, bookingFlow, opportunityType) {
  //   return CriteriaOrientedOpportunityIdCache.getTypeBucket(this._criteriaOrientedOpportunityIdCache, {
  //     criteriaName, bookingFlow, opportunityType,
  //   });
  // }

  // /**
  //  * @param {string} opportunityId
  //  * @param {object} args
  //  * @param {string} args.criteriaName
  //  * @param {string} args.bookingFlow
  //  * @param {string} args.opportunityType
  //  * @param {string} args.sellerId
  //  */
  // async setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria(opportunityId, { criteriaName, bookingFlow, opportunityType, sellerId }) {
  //   CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(this._criteriaOrientedOpportunityIdCache, opportunityId, {
  //     criteriaName, bookingFlow, opportunityType, sellerId,
  //   });
  // }

  // /**
  //  * @param {string} opportunityId
  //  * @param {string[]} unmetCriteriaDetails A list of constraint names which
  //  *   were not met by the opportunity.
  //  * @param {object} args
  //  * @param {string} args.criteriaName
  //  * @param {string} args.bookingFlow
  //  * @param {string} args.opportunityType
  //  * @param {string} args.sellerId
  //  */
  // async setOpportunityDoesNotMatchCriteria(opportunityId, unmetCriteriaDetails, { criteriaName, bookingFlow, opportunityType, sellerId }) {
  //   CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(
  //     this._criteriaOrientedOpportunityIdCache,
  //     opportunityId,
  //     unmetCriteriaDetails,
  //     {
  //       criteriaName, bookingFlow, opportunityType, sellerId,
  //     },
  //   );
  // }

  // /**
  //  * @returns {Promise<Readonly<{
  //  *   numMatched: number;
  //  *   numOrphaned: number;
  //  *   total: number;
  //  *   orphanedList: Pick<
  //  *     import('../models/core').OpportunityItemRow,
  //  *     | 'jsonLdType'
  //  *     | 'id'
  //  *     | 'modified'
  //  *     | 'jsonLd'
  //  *     | 'jsonLdId'
  //  *     | 'jsonLdParentId'
  //  *   >[]
  //  * }>>}
  //  */
  // async getOrphanData() {
  //   const rows = Array.from(this._opportunityItemRowCache.store.values())
  //     .filter((x) => x.jsonLdParentId !== null);
  //   const numMatched = rows.filter((x) => !x.waitingForParentToBeIngested).length;
  //   const numOrphaned = rows.filter((x) => x.waitingForParentToBeIngested).length;
  //   const total = rows.length;
  //   const orphanedList = rows.filter((x) => x.waitingForParentToBeIngested)
  //     .slice(0, 1000)
  //     .map((({ jsonLdType, id, modified, jsonLd, jsonLdId, jsonLdParentId }) => ({
  //       jsonLdType,
  //       id,
  //       modified,
  //       jsonLd,
  //       jsonLdId,
  //       jsonLdParentId,
  //     })));
  //   return {
  //     /** Number of (child) opportunities which have been matched to a parent */
  //     numMatched,
  //     /** Number of (child) opportunities which have not been matched to a parent */
  //     numOrphaned,
  //     /** Total number of (child) opportunities */
  //     total,
  //     /** List of orphaned (child) opportunities - limited to 1000 */
  //     orphanedList,
  //   };
  // }

  /**
   * @returns {Promise<Readonly<{
   *   numMatched: number;
   *   numOrphaned: number;
   *   total: number;
   *   orphanedList: Pick<
   *     import('../models/core').OpportunityItemRow,
   *     | 'jsonLdType'
   *     | 'id'
   *     | 'modified'
   *     | 'jsonLd'
   *     | 'jsonLdId'
   *     | 'jsonLdParentId'
   *   >[]
   * }>>}
   */
  async getOrphanData() {
    const childStatRows = await this._db('opportunity_cache')
      .whereNotNull('parent_json_ld_id')
      .where('is_parent', 0)
      .select('waiting_for_parent_to_be_ingested', this._db.raw('COUNT(*) as num_matches'))
      .groupBy('waiting_for_parent_to_be_ingested');
    const numMatched = childStatRows.find((x) => !x.waiting_for_parent_to_be_ingested)?.num_matches ?? 0;
    const numOrphaned = childStatRows.find((x) => x.waiting_for_parent_to_be_ingested)?.num_matches ?? 0;
    const total = numMatched + numOrphaned;
    const orphanedListRows = await this._db('opportunity_cache')
      .whereNotNull('parent_json_ld_id')
      .where('is_parent', 0)
      .where('waiting_for_parent_to_be_ingested', 1)
      .select('json_ld_id', 'parent_json_ld_id', 'feed_modified', 'opportunity_item_row')
      .limit(100);
    const orphanedList = orphanedListRows.map((row) => {
      /** @type {DbOpportunityItemRow} */
      const opportunityItemRow = JSON.parse(row.opportunity_item_row);
      return {
        jsonLdType: opportunityItemRow.jsonLdType,
        id: opportunityItemRow.id,
        modified: opportunityItemRow.modified,
        jsonLd: opportunityItemRow.jsonLd,
        jsonLdId: row.json_ld_id,
        jsonLdParentId: row.parent_json_ld_id,
      };
    });
    return {
      /** Number of (child) opportunities which have been matched to a parent */
      numMatched,
      /** Number of (child) opportunities which have not been matched to a parent */
      numOrphaned,
      /** Total number of (child) opportunities */
      total,
      /** List of orphaned (child) opportunities - limited to 100 */
      orphanedList,
    };
  }

  /**
   * @returns {Promise<Readonly<{
   *   numChildOrphans: number;
   *   totalNumChildren: number;
   *   totalNumOpportunities: number;
   * }>>}
   */
  async getOrphanStats() {
    const { numOrphaned: numChildOrphans, total: totalNumChildren } = await this.getOrphanData();
    const totalNumOpportunitiesRow = await this._db('opportunity_cache')
      .where('is_parent', 0)
      .where('waiting_for_parent_to_be_ingested', 0)
      .count('* as count');
    const totalNumOpportunities = Number(totalNumOpportunitiesRow[0].count);
    return {
      numChildOrphans,
      totalNumChildren,
      totalNumOpportunities,
    };
  }
}

/**
  * @param {string} sqliteFilename
  * @returns {import('knex').Knex}
  */
function createKnexConnection(sqliteFilename) {
  return knex({
    client: 'sqlite3',
    connection: {
      filename: sqliteFilename,
    },
    useNullAsDefault: true,
    pool: {
      /**
        * @param {any} conn
        * @param {function} done
        */
      afterCreate: (conn, done) => {
        conn.run('PRAGMA foreign_keys = ON', done);
      },
    },
  });
}

/**
 * @param {string} rawDbOpportunityItemRow
 * @param {string} feedModified
 * @param {0 | 1} waitingForParentToBeIngested SQLite boolean
 * @param {0 | 1} isParent SQLite boolean
 * @returns {OpportunityItemRow}
 */
function convertDbOpportunityItemRowToOpportunityItemRow(rawDbOpportunityItemRow, feedModified, waitingForParentToBeIngested, isParent) {
  /** @type {DbOpportunityItemRow} */
  const dbOpportunityItemRow = JSON.parse(rawDbOpportunityItemRow);
  return {
    ...dbOpportunityItemRow,
    isParent: Boolean(isParent),
    feedModified,
    waitingForParentToBeIngested: Boolean(waitingForParentToBeIngested),
  };
}

module.exports = {
  PersistentStore,
};
