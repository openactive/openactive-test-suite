const sqlite3 = require('sqlite3');
const { CriteriaOrientedOpportunityIdCache } = require('./criteria-oriented-opportunity-id-cache');
const { mapToObjectSummary } = require('./map-to-object-summary');

/**
 * @typedef {Record<string, unknown>} OpportunityCacheItem
 */

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
 *
 * We use multiple strategies to cache opportunity data for different use cases.
 * TODO investigate consolidation of _opportunityItemRowCache and
 * _opportunityCache to reduce memory usage & simplify code:
 * https://github.com/openactive/openactive-test-suite/issues/669.
 */
class PersistentStore {
  constructor() {
    this._db = new sqlite3.Database(':memory:');
    /**
     * A criteria-oriented cache for opportunity data. Used to get criteria-matching
     * opportunities for tests.
     */
    this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

    /**
     * Stores mappings between IDs which allow Broker to perform various kinds of
     * housekeeping to ensure that its stored opportunity date is correct.
     */
    this._opportunityHousekeepingCaches = {
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
    };
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
     *
     * Only child (e.g. Slot or ScheduledSession) opportunities are stored in
     * this cache.
     */
    this._opportunityItemRowCache = {
      /**
       * Map { [jsonLdId] => opportunityItemRow }
       *
       * @type {Map<string, import('../models/core').OpportunityItemRow>}
       */
      store: new Map(),
      /**
       * Maps each parent Opportunity ID to a set of the IDs of its children.
       *
       * @type {Map<string, Set<string>>}
       */
      parentIdIndex: new Map(),
    };
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
    this._opportunityCache = {
      /**
       * Map { [jsonLdId] => opportunityData }
       *
       * For parent opportunities (e.g. FacilityUse) only.
       *
       * @type {Map<string, OpportunityCacheItem>}
       */
      parentMap: new Map(),
      /**
       * Map { [jsonLdId] => opportunityData }
       *
       * For child opportunities (e.g. FacilityUseSlot) only.
       *
       * @type {Map<string, OpportunityCacheItem>}
       */
      childMap: new Map(),
    };
  }

  async init() {
    await this._createSqliteTables();
  }

  // CREATE UNIQUE INDEX ON criteria_oriented_opportunity_id_cache (
  //   criteria_name,
  //   booking_flow,
  //   opportunity_type,
  //   seller_id,
  //   opportunity_id
  // );
  async _createSqliteTables() {
    // Need to add unique constraints in many places!
    await sqlite3Run(this._db, `

      CREATE TABLE criteria_oriented_opportunity_id_cache (
        id INTEGER PRIMARY KEY ASC,
        criteria_name TEXT NOT NULL,
        booking_flow TEXT NOT NULL,
        opportunity_type TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        opportunity_id TEXT NOT NULL,

        UNIQUE (criteria_name, booking_flow, opportunity_type, seller_id, opportunity_id)
      );

      CREATE TABLE opportunity_housekeeping_parent_opportunity_rpde_map (
        rpde_feed_item_identifier TEXT PRIMARY KEY,
        json_ld_id TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE TABLE opportunity_housekeeping_parent_opportunity_sub_event_map (
        sub_event_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE TABLE opportunity_housekeeping_child_opportunity_rpde_map (
        rpde_feed_item_identifier TEXT PRIMARY KEY,
        json_ld_id TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE TABLE opportunity_item_row_cache_store (
        json_ld_id TEXT PRIMARY KEY,
        opportunity_item_row TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE TABLE opportunity_item_row_cache_parent_child_id_map (
        child_json_ld_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE INDEX oircpcim_parent_json_ld_id_idx
      ON opportunity_item_row_cache_parent_child_id_map (parent_json_ld_id);

      CREATE TABLE opportunity_cache_parent_map (
        parent_json_ld_id TEXT PRIMARY KEY,
        opportunity_data TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE TABLE opportunity_cache_child_map (
        child_json_ld_id TEXT PRIMARY KEY,
        opportunity_data TEXT NOT NULL
      ) WITHOUT ROWID;

    `);
  }

  async clearCaches() {
    // await sqlite3Run(this._db, `

    //   DELETE FROM opportunity_cache_parent_map;
    //   DELETE FROM opportunity_housekeeping_parent_opportunity_rpde_map;
    //   DELETE FROM opportunity_cache_child_map;
    //   DELETE FROM opportunity_housekeeping_child_opportunity_rpde_map;
    //   DELETE FROM opportunity_item_row_cache_store;
    //   DELETE FROM opportunity_item_row_cache_parent_child_id_map;
    //   DELETE FROM criteria_oriented_opportunity_id_cache;

    // `);
    this._opportunityCache.parentMap.clear();
    this._opportunityHousekeepingCaches.parentOpportunityRpdeMap.clear();
    this._opportunityCache.childMap.clear();
    this._opportunityHousekeepingCaches.opportunityRpdeMap.clear();
    this._opportunityItemRowCache.store.clear();
    this._opportunityItemRowCache.parentIdIndex.clear();
    this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();
  }

  /**
   * @param {string} id
   * @returns {Promise<Readonly<OpportunityCacheItem> | undefined>}
   */
  async getOpportunityCacheChildItem(id) {
    // const result = await sqlite3All(this._db, `
    //   SELECT opportunity_data
    //   FROM opportunity_cache_child_map
    //   WHERE child_json_ld_id = ?;
    // `, [id]);

    // if (result.length === 0) {
    //   return undefined;
    // }

    // return JSON.parse(/** @type {any} */ (result[0]).opportunity_data);
    return this._opportunityCache.childMap.get(id);
  }

  /**
   * @param {string} id
   * @returns {Promise<Readonly<OpportunityCacheItem> | undefined>}
   */
  async getOpportunityCacheParentItem(id) {
    // const result = await sqlite3All(this._db, `
    //   SELECT opportunity_data
    //   FROM opportunity_cache_parent_map
    //   WHERE parent_json_ld_id = ?;
    // `, [id]);

    // if (result.length === 0) {
    //   return undefined;
    // }

    // return JSON.parse(/** @type {any} */ (result[0]).opportunity_data);
    return this._opportunityCache.parentMap.get(id);
  }

  /**
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async hasOpportunityCacheParentItem(id) {
    // const result = await sqlite3All(this._db, `
    //   SELECT 1
    //   FROM opportunity_cache_parent_map
    //   WHERE parent_json_ld_id = ?;
    // `, [id]);

    // return result.length > 0;
    return this._opportunityCache.parentMap.has(id);
  }

  /**
   * Set a parent (e.g. FacilityUse or SessionSeries) opportunity in the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches, but does NOT update the row
   * cache, which must be done separately.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   * @param {string} jsonLdId The .data['@id'] of the Opportunity
   * @param {Record<string, unknown>} itemData the Opportunity data
   */
  async setOpportunityCacheParentItem(feedItemIdentifier, jsonLdId, itemData) {
    // await sqlite3Run(this._db, `
    //   INSERT INTO opportunity_housekeeping_parent_opportunity_rpde_map
    //   (rpde_feed_item_identifier, json_ld_id)
    //   VALUES (?, ?)
    //   ON CONFLICT(rpde_feed_item_identifier) DO UPDATE SET
    //     json_ld_id = excluded.json_ld_id;

    //   INSERT INTO opportunity_cache_parent_map
    //   (parent_json_ld_id, opportunity_data)
    //   VALUES (?, ?)
    //   ON CONFLICT(parent_json_ld_id) DO UPDATE SET
    //     opportunity_data = excluded.opportunity_data;
    // `, [
    //   feedItemIdentifier, jsonLdId,
    //   jsonLdId, JSON.stringify(itemData),
    // ]);
    this._opportunityHousekeepingCaches.parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
    this._opportunityCache.parentMap.set(jsonLdId, itemData);
  }

  /**
   * Set a child (e.g. Slot or ScheduledSession) opportunity in the opportunity
   * cache.
   *
   * This also updates internal housekeeping caches, but does NOT update the row
   * cache, which must be done separately.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   * @param {string} jsonLdId The .data['@id'] of the Opportunity
   * @param {Record<string, unknown>} itemData the Opportunity data
   */
  async setOpportunityCacheChildItem(feedItemIdentifier, jsonLdId, itemData) {
    // await sqlite3Run(this._db, `
    //   INSERT INTO opportunity_housekeeping_child_opportunity_rpde_map
    //   (rpde_feed_item_identifier, json_ld_id)
    //   VALUES (?, ?)
    //   ON CONFLICT(rpde_feed_item_identifier) DO UPDATE SET
    //     json_ld_id = excluded.json_ld_id;

    //   INSERT INTO opportunity_cache_child_map
    //   (child_json_ld_id, opportunity_data)
    //   VALUES (?, ?)
    //   ON CONFLICT(child_json_ld_id) DO UPDATE SET
    //     opportunity_data = excluded.opportunity_data;
    // `, [
    //   feedItemIdentifier, jsonLdId,
    //   jsonLdId, JSON.stringify(itemData),
    // ]);
    this._opportunityHousekeepingCaches.opportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
    this._opportunityCache.childMap.set(jsonLdId, itemData);
  }

  /**
   * Delete a parent (e.g. FacilityUse or SessionSeries) opportunity from the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches and the row cache.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   */
  async deleteOpportunityCacheParentItem(feedItemIdentifier) {
    // const parentJsonLdId = (async () => {
    //   const result = await sqlite3All(this._db, `
    //     SELECT json_ld_id
    //     FROM opportunity_housekeeping_parent_opportunity_rpde_map
    //     WHERE rpde_feed_item_identifier = ?;
    //   `, [feedItemIdentifier]);
    //   return result.length > 0 ? /** @type {any} */ (result[0]).json_ld_id : undefined;
    // })();
    // if (parentJsonLdId) {
    //   // Delete child map items
    //   await sqlite3Run(this._db, `
    //     DELETE FROM opportunity_item_row_cache_parent_child_id_map
    //     WHERE parent_json_ld_id = ?;
    //   `, [parentJsonLdId]);
    //   // Delete from opportunity_item_row_cache_store where
    //   // json_ld_id IN (select sub_event_id from opportunity_housekeeping_parent_opportunity_sub_event_map where parent_json_ld_id = {parentJsonLdId})
    //   /*
    //   Actions:
    //   - Delete from opportunity_item_row_cache_parent_child_id_map where
    //     - child_json_ld_id =
    //       SELECT sub_event_map.sub_event_id
    //       FROM opportunity_housekeeping_parent_opportunity_sub_event_map
    //       WHERE parent_json_ld_id = {parentJsonLdId}
    //   */
    // }
    // /*
    // Actions:
    // - Delete from opportunity_item_row_cache_parent_child_id_map where
    //   - child_json_ld_id =
    //     SELECT sub_event_map.sub_event_id
    //     FROM opportunity_housekeeping_parent_opportunity_sub_event_map sub_event_map
    //     INNER JOIN
    //       opportunity_housekeeping_parent_opportunity_rpde_map parent_rpde_map
    //         ON (sub_event_map.parent_json_ld_id=parent_rpde_map.json_ld_id)
    //     WHERE
    //       parent_rpde_map.rpde_feed_item_identifier = {feedItemIdentifier}
    //   - parent_json_ld_id = ...
    // */
    const jsonLdId = this._opportunityHousekeepingCaches.parentOpportunityRpdeMap.get(feedItemIdentifier);

    // If we had subEvents for this item, then we must be sure to delete the associated opportunityItems
    // that were made for them:
    if (this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
      for (const subEventId of this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(jsonLdId)) {
        this._deleteOpportunityItemRowCacheChildItem(subEventId);
      }
    }

    this._opportunityHousekeepingCaches.parentOpportunityRpdeMap.delete(feedItemIdentifier);
    this._opportunityCache.parentMap.delete(jsonLdId);
    this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.delete(jsonLdId);
  }

  /**
   * Delete a child (e.g. Slot or ScheduledSession) opportunity from the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches and the row cache.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   */
  async deleteOpportunityCacheChildItem(feedItemIdentifier) {
    const jsonLdId = this._opportunityHousekeepingCaches.opportunityRpdeMap.get(feedItemIdentifier);
    this._opportunityCache.childMap.delete(jsonLdId);
    this._opportunityHousekeepingCaches.opportunityRpdeMap.delete(feedItemIdentifier);

    this._deleteOpportunityItemRowCacheChildItem(jsonLdId);
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
   * @param {{data: {subEvent: {'@id'?: string, id?:string}[]}}} parentRpdeItem
   * @param {string} parentJsonLdId
   */
  async reconcileParentSubEventChanges(parentRpdeItem, parentJsonLdId) {
    const oldSubEventIds = this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId);
    const newSubEventIds = parentRpdeItem.data.subEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter((x) => x);

    if (!oldSubEventIds) {
      if (newSubEventIds.length > 0) {
        this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.set(parentJsonLdId, newSubEventIds);
      }
    } else {
      for (const subEventId of oldSubEventIds) {
        if (!newSubEventIds.includes(subEventId)) {
          this._deleteOpportunityItemRowCacheChildItem(subEventId);
          this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId).filter((x) => x !== subEventId);
        }
      }
      for (const subEventId of newSubEventIds) {
        if (!oldSubEventIds.includes(subEventId)) {
          this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId).push(subEventId);
        }
      }
    }
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<Readonly<import('../models/core').OpportunityItemRow> | undefined>}
   */
  async getOpportunityItemRow(jsonLdId) {
    return this._opportunityItemRowCache.store.get(jsonLdId);
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
    const row = this._opportunityItemRowCache.store.get(childJsonLdId);
    if (row) {
      row.feedModified = newFeedModified;
      row.waitingForParentToBeIngested = false;
      return row;
    }
    return undefined;
  }

  /**
   * Delete a child (e.g. Slot or ScheduledSession) opportunity from the
   * opportunity item row cache.
   *
   * @param {string} jsonLdId
   */
  _deleteOpportunityItemRowCacheChildItem(jsonLdId) {
    const row = this._opportunityItemRowCache.store.get(jsonLdId);
    if (row) {
      // Delete from its parent's index
      const idx = this._opportunityItemRowCache.parentIdIndex.get(row.jsonLdParentId);
      if (idx) {
        idx.delete(jsonLdId);
      }
      // Delete from the store
      this._opportunityItemRowCache.store.delete(jsonLdId);
    }
  }

  /**
   * @param {import('../models/core').OpportunityItemRow} row
   */
  async storeOpportunityItemRowCacheChildItem(row) {
    // Associate the child with its parent
    if (row.jsonLdParentId != null) {
      if (!this._opportunityItemRowCache.parentIdIndex.has(row.jsonLdParentId)) {
        this._opportunityItemRowCache.parentIdIndex.set(row.jsonLdParentId, new Set());
      }
      this._opportunityItemRowCache.parentIdIndex.get(row.jsonLdParentId).add(row.jsonLdId);
    }

    // Cache it
    this._opportunityItemRowCache.store.set(row.jsonLdId, row);
  }

  /**
   * Get (JSON-LD) IDs of all opportunities which are children of the specified parent.
   *
   * @param {string} parentJsonLdId
   * @returns {Promise<Readonly<Set<string>>>}
   */
  async getOpportunityItemRowCacheChildIdsFromParent(parentJsonLdId) {
    if (!this._opportunityItemRowCache.parentIdIndex.has(parentJsonLdId)) {
      return new Set();
    }
    return this._opportunityItemRowCache.parentIdIndex.get(parentJsonLdId);
  }

  /**
   * @returns {Promise<Readonly<{
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
   * }>>}
   */
  async getCriteriaOrientedOpportunityIdCacheSummary() {
    return /** @type {any} */ (mapToObjectSummary(this._criteriaOrientedOpportunityIdCache));
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   * @returns {Promise<Readonly<import('./criteria-oriented-opportunity-id-cache').OpportunityIdCacheTypeBucket>>}
   */
  async getCriteriaOrientedOpportunityIdCacheTypeBucket(criteriaName, bookingFlow, opportunityType) {
    return CriteriaOrientedOpportunityIdCache.getTypeBucket(this._criteriaOrientedOpportunityIdCache, {
      criteriaName, bookingFlow, opportunityType,
    });
  }

  /**
   * @param {string} opportunityId
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  async setCriteriaOrientedOpportunityIdCacheOpportunityMatchesCriteria(opportunityId, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    CriteriaOrientedOpportunityIdCache.setOpportunityMatchesCriteria(this._criteriaOrientedOpportunityIdCache, opportunityId, {
      criteriaName, bookingFlow, opportunityType, sellerId,
    });
  }

  /**
   * @param {string} opportunityId
   * @param {string[]} unmetCriteriaDetails
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  async setOpportunityDoesNotMatchCriteria(opportunityId, unmetCriteriaDetails, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    CriteriaOrientedOpportunityIdCache.setOpportunityDoesNotMatchCriteria(
      this._criteriaOrientedOpportunityIdCache,
      opportunityId,
      unmetCriteriaDetails,
      {
        criteriaName, bookingFlow, opportunityType, sellerId,
      },
    );
  }

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
    const rows = Array.from(this._opportunityItemRowCache.store.values())
      .filter((x) => x.jsonLdParentId !== null);
    const numMatched = rows.filter((x) => !x.waitingForParentToBeIngested).length;
    const numOrphaned = rows.filter((x) => x.waitingForParentToBeIngested).length;
    const total = rows.length;
    const orphanedList = rows.filter((x) => x.waitingForParentToBeIngested)
      .slice(0, 1000)
      .map((({ jsonLdType, id, modified, jsonLd, jsonLdId, jsonLdParentId }) => ({
        jsonLdType,
        id,
        modified,
        jsonLd,
        jsonLdId,
        jsonLdParentId,
      })));
    return {
      /** Number of (child) opportunities which have been matched to a parent */
      numMatched,
      /** Number of (child) opportunities which have not been matched to a parent */
      numOrphaned,
      /** Total number of (child) opportunities */
      total,
      /** List of orphaned (child) opportunities - limited to 1000 */
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
    const totalNumOpportunities = Array.from(this._opportunityItemRowCache.store.values())
      .filter((x) => !x.waitingForParentToBeIngested).length;
    return {
      numChildOrphans,
      totalNumChildren,
      totalNumOpportunities,
    };
  }
}

/**
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {unknown[] | undefined} [params]
 */
function sqlite3Run(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params || [], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * @param {sqlite3.Database} db
 * @param {string} sql
 * @param {unknown[] | undefined} [params]
 * @returns {Promise<unknown[]>}
 */
function sqlite3All(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params || [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  PersistentStore,
};
