const { criteria } = require('@openactive/test-interface-criteria');

/**
 * @typedef {Set<string>} OpportunityIdCacheSellerCompartment
 * @typedef {Map<string, OpportunityIdCacheSellerCompartment>} OpportunityIdCacheTypeBucket
 * @typedef {Map<string, OpportunityIdCacheTypeBucket>} OpportunityIdCacheCriteriaBucket
 * @typedef {Map<string, OpportunityIdCacheCriteriaBucket>} OpportunityIdCache
 */

/**
 * Cache of Opportunity IDs. They are stored here according to criteria that they match (e.g. Opportunity Criteria,
 * Opportunity Type, etc).
 * In this way, they can be selected when a request to get a random opportunity matching some criteria comes in.
 *
 * Schema:
 *
 * Criteria Name
 * -> Opportunity Type
 *   -> Seller ID
 *     -> Set<Opportunity ID>
 */
const OpportunityIdCache = {
  /**
   * @returns {OpportunityIdCache}
   */
  create() {
    return new Map(
      criteria.map((c) => c.name).map((criteriaName) => (
        // Criteria Name -> ...
        [criteriaName, new Map([
          'ScheduledSession',
          'FacilityUseSlot',
          'IndividualFacilityUseSlot',
          'CourseInstance',
          'HeadlineEvent',
          'Event',
          'HeadlineEventSubEvent',
          'CourseInstanceSubEvent',
          'OnDemandEvent',
        ].map((opportunityType) => (
          // -> Opportunity Type -> ...
          [opportunityType, new Map()]
        )))]
      )),
    );
  },
  /**
   * @param {string} criteriaName
   * @param {string} opportunityType
   * @param {OpportunityIdCache} cache
   * @returns {OpportunityIdCacheTypeBucket}
   */
  getTypeBucket(criteriaName, opportunityType, cache) {
    const criteriaBucket = cache.get(criteriaName);
    if (!criteriaBucket) throw new Error('The specified testOpportunityCriteria is not currently supported.');
    const typeBucket = criteriaBucket.get(opportunityType);
    if (!typeBucket) throw new Error('The specified opportunityType is not currently supported.');
    return typeBucket;
  },
};

module.exports = {
  OpportunityIdCache,
};
