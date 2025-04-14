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
 */
class PersistentStore {
  constructor(sqliteFilename = ':memory:') {
    this._sqliteFilename = sqliteFilename;
    /** @type {sqlite3.Database | undefined} */
    this._db = undefined;

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
       * @type {Map<string, string>}
       */
      rpdeMap: new Map(),
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
  }

  // eslint-disable-next-line class-methods-use-this
  async init() {
    this._db = await createSqlite3Database(this._sqliteFilename);
    await this._createSqliteTables();
    // If running SQLite on a file, then tables may need to be cleared of data
    // from a previous run
    await this.clearCaches();
  }

  async _createSqliteTables() {
    /*
    Possible improvements:

    - opportunity_housekeeping_parent_opportunity_rpde_map & opportunity_housekeeping_opportunity_rpde_map:
      - Combine and add an is_parent column (if even needed)
    - Replace opportunity_item_row_cache_store, opportunity_item_row_cache_parent_child_id_map, opportunity_cache_parent_map, opportunity_cache_child_map with:
      one table:
        - json_ld_id: TEXT PRIMARY KEY
        - parent_json_ld_id: TEXT (null if parent)
        - opportunity_item_row: TEXT NOT NULL
    - row.waitingForParentToBeIngested: Replace with join to parent
      - It's only used in orphan stats

    Results of these improvements:
    - criteria_oriented_opportunity_id_cache
      - Caches criteria satisfaction
    - opportunity_housekeeping_opportunity_rpde_map
      - Maps feed identifier to jsonLdId
    - opportunity_housekeeping_parent_opportunity_sub_event_map
      - Used to manage .subEvents
    - opportunity_item_row_cache_store
      - Opportunity cache
    */

    await sqlite3Run(this._db, `

      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS opportunity_item_row_cache_store (
        json_ld_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT,
        opportunity_item_row TEXT NOT NULL
      ) WITHOUT ROWID;

      CREATE INDEX IF NOT EXISTS oircs_parent_json_ld_id_idx
      ON opportunity_item_row_cache_store (parent_json_ld_id);

      CREATE TABLE IF NOT EXISTS criteria_oriented_opportunity_id_cache (
        id INTEGER PRIMARY KEY ASC,
        criteria_name TEXT NOT NULL,
        booking_flow TEXT NOT NULL,
        opportunity_type TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        opportunity_id TEXT NOT NULL,

        UNIQUE (criteria_name, booking_flow, opportunity_type, seller_id, opportunity_id)

        FOREIGN KEY (opportunity_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE,
      );

      CREATE TABLE IF NOT EXISTS opportunity_housekeeping_parent_opportunity_sub_event_map (
        sub_event_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT NOT NULL,

        FOREIGN KEY (parent_json_ld_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE,
        FOREIGN KEY (sub_event_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE
      ) WITHOUT ROWID;

      CREATE TABLE IF NOT EXISTS opportunity_housekeeping_opportunity_rpde_map (
        rpde_feed_item_identifier TEXT PRIMARY KEY,
        json_ld_id TEXT NOT NULL,

        FOREIGN KEY (json_ld_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE
      ) WITHOUT ROWID;

    `);
  }

  async clearCaches() {
    // this._opportunityHousekeepingCaches.rpdeMap.clear();
    // this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.clear();
    // this._opportunityItemRowCache.store.clear();
    // this._opportunityItemRowCache.parentIdIndex.clear();
    // this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

    await sqlite3Run(this._db, `
      DELETE FROM criteria_oriented_opportunity_id_cache;
      DELETE FROM opportunity_housekeeping_parent_opportunity_sub_event_map;
      DELETE FROM opportunity_housekeeping_opportunity_rpde_map;
      DELETE FROM opportunity_item_row_cache_store;
    `);
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<Readonly<import('../models/core').OpportunityItemRow> | undefined>}
   */
  async getOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.get(jsonLdId);
    const res = await sqlite3All(this._db, `
      SELECT opportunity_item_row
      FROM opportunity_item_row_cache_store
      WHERE json_ld_id = ?
    `, [jsonLdId]);
    if (res.length === 0) {
      return undefined;
    }
    return JSON.parse(/** @type {any} */(res[0]).opportunity_item_row);
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<boolean>}
   */
  async hasOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.has(jsonLdId);
    const res = await sqlite3All(this._db, `
      SELECT 1
      FROM opportunity_item_row_cache_store
      WHERE json_ld_id = ?
    `, [jsonLdId]);
    return res.length > 0;
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
    await sqlite3Run(this._db, `
      INSERT INTO opportunity_item_row_cache_store (
        json_ld_id,
        parent_json_ld_id,
        opportunity_item_row
      ) VALUES (?, ?, ?)
      ON CONFLICT(json_ld_id) DO UPDATE SET
        parent_json_ld_id = excluded.parent_json_ld_id,
        opportunity_item_row = excluded.opportunity_item_row
    `, [itemRow.jsonLdId, itemRow.jsonLdParentId, JSON.stringify(itemRow)]);
    // If there is a feedItemIdentifier, then cache the mapping between it and
    // the jsonLdId so that it can be used to process RPDE deletes.
    if (feedItemIdentifier) {
      await sqlite3Run(this._db, `
        INSERT INTO opportunity_housekeeping_opportunity_rpde_map (
          rpde_feed_item_identifier,
          json_ld_id
        ) VALUES (?, ?)
        ON CONFLICT(rpde_feed_item_identifier) DO UPDATE SET
          json_ld_id = excluded.json_ld_id
      `, [feedItemIdentifier, itemRow.jsonLdId]);
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

    // TODO optimise: by getting jsonLdId in a sub-query
    // This will also delete related rows from other tables via delete cascades.
    await sqlite3Run(this._db, `
      DELETE FROM opportunity_item_row_cache_store
      WHERE json_ld_id = ?
    `, [jsonLdId]);
    // // If we had subEvents for this item, then we must be sure to delete the
    // // associated opportunityItems that were made for them:
    // await sqlite3Run(this._db, `
    //   DELETE FROM opportunity_item_row_cache_store
    //   WHERE json_ld_id IN (
    //     SELECT sub_event_id
    //     FROM opportunity_housekeeping_parent_opportunity_sub_event_map
    //     WHERE parent_json_ld_id = ?
    //   );
    // `, [jsonLdId]);
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
    await sqlite3Run(this._db, `
      DELETE FROM opportunity_item_row_cache_store
      WHERE json_ld_id = ?
    `, [jsonLdId]);
  }

  /**
   * @param {string} feedItemIdentifier
   * @returns {Promise<string | undefined>}
   */
  async _getJsonLdIdFromFeedItemIdentifier(feedItemIdentifier) {
    const res = await sqlite3All(this._db, `
      SELECT json_ld_id
      FROM opportunity_housekeeping_opportunity_rpde_map
      WHERE rpde_feed_item_identifier = ?
    `, [feedItemIdentifier]);
    if (res.length === 0) {
      return undefined;
    }
    return /** @type {any} */(res[0]).rpde_feed_item_identifier;
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
    const oldSubEventIds = this._opportunityHousekeepingCaches.parentOpportunitySubEventMap.get(parentJsonLdId);
    const newSubEventIds = parentSubEvent.map((subEvent) => subEvent['@id'] || subEvent.id).filter((x) => x);

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
   * Get (JSON-LD) IDs of all opportunities which are children of the specified
   * parent, EXCEPT for those children which are derived from a .subEvent.
   *
   * @param {string} parentJsonLdId
   * @returns {Promise<Readonly<Set<string>>>}
   */
  async getOpportunityNonSubEventChildIdsFromParent(parentJsonLdId) {
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
 * @param {string} sqliteFilename
 * @returns {Promise<sqlite3.Database>}
 */
function createSqlite3Database(sqliteFilename) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqliteFilename, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
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
// eslint-disable-next-line no-unused-vars
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
