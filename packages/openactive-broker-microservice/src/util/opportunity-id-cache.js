const { criteria } = require('@openactive/test-interface-criteria');

/**
 * @typedef {Set<string>} OpportunityIdCacheSellerCompartment
 * @typedef {{contents: Map<string, OpportunityIdCacheSellerCompartment>, criteriaErrors: Map<string, number> }} OpportunityIdCacheTypeBucket
 * @typedef {Map<string, OpportunityIdCacheTypeBucket>} OpportunityIdCacheBookingFlowBucket
 * @typedef {Map<string, OpportunityIdCacheBookingFlowBucket>} OpportunityIdCacheCriteriaBucket
 * @typedef {Map<string, OpportunityIdCacheCriteriaBucket>} OpportunityIdCacheType
 */

/**
 * Cache of Opportunity IDs. They are stored here according to criteria that they match (e.g. Opportunity Criteria,
 * Opportunity Type, etc).
 * In this way, they can be selected when a request to get a random opportunity matching some criteria comes in.
 *
 * Schema:
 *
 * -> {Criteria Name}
 *   -> {Booking Flow}
 *     -> {Opportunity Type}
 *       -> contents
 *         -> {Seller ID}
 *           -> {Set<Opportunity ID>}
 *       -> criteriaErrors
 *         -> {constraint name (name of the constraint that failed)}
 *           -> {number of items which failed to meet the criteria due to this constraint}
 */
const OpportunityIdCache = {
  /**
   * @returns {OpportunityIdCacheType}
   */
  create() {
    return new Map(
      criteria.map((c) => c.name).map((criteriaName) => (
        // -> Criteria Name -> ..
        [criteriaName, new Map([
          'OpenBookingSimpleFlow',
          'OpenBookingApprovalFlow',
        ].map((bookingFlow) => (
          // .. -> Booking Flow -> ..
          [bookingFlow, new Map([
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
            // .. -> Opportunity Type -> ...
            [opportunityType, /** @type {OpportunityIdCacheTypeBucket} */{
              contents: new Map(),
              criteriaErrors: new Map(),
            }]
          )))]
        )))])),
    );
  },
  /**
   * @param {OpportunityIdCacheType} cache
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @returns {OpportunityIdCacheTypeBucket}
   */
  getTypeBucket(cache, { criteriaName, bookingFlow, opportunityType }) {
    const criteriaBucket = cache.get(criteriaName);
    if (!criteriaBucket) throw new Error(`The specified testOpportunityCriteria (${criteriaName}) is not currently supported.`);
    const bookingFlowBucket = criteriaBucket.get(bookingFlow);
    if (!bookingFlowBucket) throw new Error(`The specified bookingFlow (${bookingFlow}) is not currently supported.`);
    const typeBucket = bookingFlowBucket.get(opportunityType);
    if (!typeBucket) throw new Error(`The specified opportunityType (${opportunityType}) is not currently supported.`);
    return typeBucket;
  },
};

module.exports = {
  OpportunityIdCache,
};
