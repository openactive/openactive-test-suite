const { CriteriaOrientedOpportunityIdCache } = require('./criteria-oriented-opportunity-id-cache');
const { mapToObjectSummary } = require('./map-to-object-summary');

class PersistentStore {
  constructor() {
    // /**
    //  * For each Test Dataset, a set of IDs of Opportunities which are now
    //  * considered "locked" because they have already been used in a test.
    //  *
    //  * @type {Map<string, Set<string>>}
    //  */
    // this._lockedOpportunityIdsByTestDataset = new Map();
    /**
     * A criteria-oriented cache for opportunity data. Used to get criteria-matching
     * opportunities for tests.
     */
    this._criteriaOrientedOpportunityIdCache = CriteriaOrientedOpportunityIdCache.create();

    // TODO2 check for all uses of this and following fields
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
       * @type {Map<string, Record<string, unknown>>}
       */
      parentMap: new Map(),
      /**
       * Map { [jsonLdId] => opportunityData }
       *
       * For child opportunities (e.g. FacilityUseSlot) only.
       *
       * @type {Map<string, Record<string, unknown>>}
       */
      childMap: new Map(),
    };
  }

  clearCaches() {
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
   */
  getOpportunityCacheChildItem(id) {
    return this._opportunityCache.childMap.get(id);
  }

  /**
   * @param {string} id
   */
  getOpportunityCacheParentItem(id) {
    return this._opportunityCache.parentMap.get(id);
  }

  /**
   * @param {string} id
   */
  hasOpportunityCacheParentItem(id) {
    return this._opportunityCache.parentMap.has(id);
  }

  /**
   * Set a parent (e.g. FacilityUse or SessionSeries) opportunity in the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   * @param {string} jsonLdId The .data['@id'] of the Opportunity
   * @param {Record<string, unknown>} itemData the Opportunity data
   */
  setOpportunityCacheParentItem(feedItemIdentifier, jsonLdId, itemData) {
    this._opportunityHousekeepingCaches.parentOpportunityRpdeMap.set(feedItemIdentifier, jsonLdId);
    this._opportunityCache.parentMap.set(jsonLdId, itemData);
  }

  /**
   * Delete a parent (e.g. FacilityUse or SessionSeries) opportunity from the
   * opportunity cache.
   *
   * This also updates internal housekeeping caches.
   *
   * @param {string} feedItemIdentifier `{feedIdentifier}---{rpdeItemId}`
   */
  deleteOpportunityCacheParentItem(feedItemIdentifier) {
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
  reconcileParentSubEventChanges(parentRpdeItem, parentJsonLdId) {
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
   * @returns {import('../models/core').OpportunityItemRow | undefined}
   */
  getOpportunityItemRow(jsonLdId) {
    return this._opportunityItemRowCache.store.get(jsonLdId);
  }

  /**
   * Mark a child opportunity (in the row cache) as having found its parent.
   *
   * It also returns the row (if there is one).
   *
   * @param {string} childJsonLdId
   * @param {string} newFeedModified
   * @returns {import('../models/core').OpportunityItemRow | undefined}
   */
  markOpportunityItemRowChildAsFoundParent(childJsonLdId, newFeedModified) {
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
  storeOpportunityItemRowCacheChildItem(row) {
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
   * @returns {Set<string>}
   */
  getOpportunityItemRowCacheChildIdsFromParent(parentJsonLdId) {
    if (!this._opportunityItemRowCache.parentIdIndex.has(parentJsonLdId)) {
      return new Set();
    }
    return this._opportunityItemRowCache.parentIdIndex.get(parentJsonLdId);
  }

  /**
   * @returns {{
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
   * }}
   */
  getCriteriaOrientedOpportunityIdCacheSummary() {
    return /** @type {any} */ (mapToObjectSummary(this._criteriaOrientedOpportunityIdCache));
  }

  /**
   * @param {string} criteriaName
   * @param {string} bookingFlow
   * @param {string} opportunityType
   */
  getCriteriaOrientedOpportunityIdCacheTypeBucket(criteriaName, bookingFlow, opportunityType) {
    return CriteriaOrientedOpportunityIdCache.getTypeBucket(this._criteriaOrientedOpportunityIdCache, {
      criteriaName, bookingFlow, opportunityType,
    });
  }

  getOrphanData() {
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

  getOrphanStats() {
    const { numOrphaned: numChildOrphans, total: totalNumChildren } = this.getOrphanData();
    const totalNumOpportunities = Array.from(this._opportunityItemRowCache.store.values())
      .filter((x) => !x.waitingForParentToBeIngested).length;
    return {
      numChildOrphans,
      totalNumChildren,
      totalNumOpportunities,
    };
  }
}

module.exports = {
  PersistentStore,
};
