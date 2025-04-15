const knex = require('knex');
const { omit } = require('lodash');
const { CriteriaOrientedOpportunityIdCache } = require('./criteria-oriented-opportunity-id-cache');
const { mapToObjectSummary } = require('./map-to-object-summary');

/**
 * @typedef {import('../models/core').OpportunityItemRow} OpportunityItemRow
 */
/**
 * @typedef {Record<string, unknown>} OpportunityCacheItem
 * @typedef {Omit<
 *   OpportunityItemRow,
 *   | 'feedModified'
 *   | 'waitingForParentToBeIngested'
 * >} DbOpportunityItemRow
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
    /** @type {import('knex').Knex | undefined} */
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

  async init() {
    console.log('init() - call');
    this._db = createKnexConnection(this._sqliteFilename);
    await this._createSqliteTables();
    console.log('init() - created tables');
    // If running SQLite on a file, then tables may need to be cleared of data
    // from a previous run
    await this.clearCaches();
    console.log('init() - cleared caches');
  }

  async stop() {
    await this._db.destroy();
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

    // PRAGMA foreign_keys = ON;

    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS opportunity_item_row_cache_store (
        json_ld_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT,
        feed_modified TEXT NOT NULL,
        waiting_for_parent_to_be_ingested BOOLEAN NOT NULL,
        opportunity_item_row TEXT NOT NULL
      ) WITHOUT ROWID
    `);
    await this._db.raw(`
      CREATE INDEX IF NOT EXISTS oircs_parent_json_ld_id_idx
      ON opportunity_item_row_cache_store (parent_json_ld_id)
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS criteria_oriented_opportunity_id_cache (
        id INTEGER PRIMARY KEY ASC,
        criteria_name TEXT NOT NULL,
        booking_flow TEXT NOT NULL,
        opportunity_type TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        opportunity_id TEXT NOT NULL,

        UNIQUE (criteria_name, booking_flow, opportunity_type, seller_id, opportunity_id)

        FOREIGN KEY (opportunity_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE
      )
    `);
    await this._db.raw(`
      CREATE TABLE IF NOT EXISTS opportunity_housekeeping_parent_opportunity_sub_event_map (
        sub_event_id TEXT PRIMARY KEY,
        parent_json_ld_id TEXT NOT NULL,

        FOREIGN KEY (parent_json_ld_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE,
        FOREIGN KEY (sub_event_id) REFERENCES opportunity_item_row_cache_store(json_ld_id) ON DELETE CASCADE
      ) WITHOUT ROWID;
    `);
    await this._db.raw(`
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

    await this._db('criteria_oriented_opportunity_id_cache').delete();
    await this._db('opportunity_housekeeping_parent_opportunity_sub_event_map').delete();
    await this._db('opportunity_housekeeping_opportunity_rpde_map').delete();
    await this._db('opportunity_item_row_cache_store').delete();
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<Readonly<import('../models/core').OpportunityItemRow> | undefined>}
   */
  async getOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.get(jsonLdId);
    const result = await this._db('opportunity_item_row_cache_store')
      .select('opportunity_item_row', 'feed_modified', 'waiting_for_parent_to_be_ingested')
      .where('json_ld_id', jsonLdId)
      .first();
    if (!result) {
      return undefined;
    }
    return convertDbOpportunityItemRowToOpportunityItemRow(
      result.opportunity_item_row,
      result.feed_modified,
      result.waiting_for_parent_to_be_ingested,
    );
  }

  /**
   * @param {string} jsonLdId
   * @returns {Promise<boolean>}
   */
  async hasOpportunityItemRow(jsonLdId) {
    // return this._opportunityItemRowCache.store.has(jsonLdId);
    const result = await this._db('opportunity_item_row_cache_store')
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
   * @param {object} otherData
   * @param {string} otherData.feedModified
   * @param {boolean} otherData.waitingForParentToBeIngested
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

    const dbItemRow = omit(itemRow, 'feedModified', 'waitingForParentToBeIngested');
    // Insert or update the opportunity item row
    await this._db('opportunity_item_row_cache_store')
      .insert({
        json_ld_id: itemRow.jsonLdId,
        parent_json_ld_id: itemRow.jsonLdParentId,
        feed_modified: itemRow.feedModified,
        waiting_for_parent_to_be_ingested: itemRow.waitingForParentToBeIngested,
        opportunity_item_row: JSON.stringify(dbItemRow),
      })
      .onConflict('json_ld_id')
      .merge(['parent_json_ld_id', 'feed_modified', 'waiting_for_parent_to_be_ingested', 'opportunity_item_row']);

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

    // TODO optimise: by getting jsonLdId in a sub-query
    // This will also delete related rows from other tables via delete cascades.
    if (jsonLdId) {
      // This will also delete related rows from other tables via delete cascades.
      await this._db('opportunity_item_row_cache_store')
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
      await this._db('opportunity_item_row_cache_store')
        .where('json_ld_id', jsonLdId)
        .delete();
    }
  }

  // TODO3 find some way to test the functions so far (to verify knex) before
  // moving onto reconcileParentSubEventChanges
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
    // const row = this._opportunityItemRowCache.store.get(childJsonLdId);
    // if (row) {
    //   row.feedModified = newFeedModified;
    //   row.waitingForParentToBeIngested = false;
    //   return row;
    // }
    // return undefined;
    const rows = await this._db('opportunity_item_row_cache_store')
      .where('json_ld_id', childJsonLdId)
      .returning(['opportunity_item_row', 'feed_modified', 'waiting_for_parent_to_be_ingested'])
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
    );
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
    // if (!this._opportunityItemRowCache.parentIdIndex.has(parentJsonLdId)) {
    //   return new Set();
    // }
    // return this._opportunityItemRowCache.parentIdIndex.get(parentJsonLdId);
    const childRows = await this._db('opportunity_item_row_cache_store')
      .select('json_ld_id')
      .where('parent_json_ld_id', parentJsonLdId);

    if (!childRows || childRows.length === 0) {
      return new Set();
    }

    return new Set(childRows.map((row) => row.json_ld_id));
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
 * @param {0 | 1} waitingForParentToBeIngested Though it is a boolean column in
 *   SQLite, it comes back as a 0 or 1 in query results.
 * @returns {OpportunityItemRow}
 */
function convertDbOpportunityItemRowToOpportunityItemRow(rawDbOpportunityItemRow, feedModified, waitingForParentToBeIngested) {
  /** @type {DbOpportunityItemRow} */
  const dbOpportunityItemRow = JSON.parse(rawDbOpportunityItemRow);
  return {
    ...dbOpportunityItemRow,
    feedModified,
    waitingForParentToBeIngested: Boolean(waitingForParentToBeIngested),
  };
}

module.exports = {
  PersistentStore,
};
