const { criteria } = require('@openactive/test-interface-criteria');

/**
 * @typedef {Set<string>} OpportunityIdCacheSellerCompartment
 * @typedef {{contents: Map<string, OpportunityIdCacheSellerCompartment>, criteriaErrors: Map<string, number> }} OpportunityIdCacheTypeBucket
 * @typedef {Map<string, OpportunityIdCacheTypeBucket>} OpportunityIdCacheBookingFlowBucket
 * @typedef {Map<string, OpportunityIdCacheBookingFlowBucket>} OpportunityIdCacheCriteriaBucket
 * @typedef {Map<string, OpportunityIdCacheCriteriaBucket>} OpportunityIdCacheType
 */

/**
 * Cache of Opportunity IDs. They are stored here according to criteria that
 * they match (e.g. Opportunity Criteria, Opportunity Type, etc). In this way,
 * they can be selected when a request to get a random opportunity matching some
 * criteria comes in.
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
 *         -> {constraint name (name of the constraint that was not met)}
 *           -> {number of items which failed to meet the criteria due to this constraint}
 */
const CriteriaOrientedOpportunityIdCache = {
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

  /**
   * ! `cache` is mutated.
   *
   * @param {OpportunityIdCacheType} cache
   * @param {string} opportunityId
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  setOpportunityMatchesCriteria(cache, opportunityId, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    const typeBucket = CriteriaOrientedOpportunityIdCache.getTypeBucket(cache, {
      criteriaName, bookingFlow, opportunityType,
    });
    if (!typeBucket.contents.has(sellerId)) {
      typeBucket.contents.set(sellerId, new Set());
    }
    const sellerCompartment = typeBucket.contents.get(sellerId);
    sellerCompartment.add(opportunityId);
    // Hide criteriaErrors if at least one matching item is found
    typeBucket.criteriaErrors = undefined;
  },

  /**
   * ! `cache` is mutated.
   *
   * @param {OpportunityIdCacheType} cache
   * @param {string} opportunityId
   * @param {unknown[]} unmetCriteriaDetails
   * @param {object} args
   * @param {string} args.criteriaName
   * @param {string} args.bookingFlow
   * @param {string} args.opportunityType
   * @param {string} args.sellerId
   */
  setOpportunityDoesNotMatchCriteria(cache, opportunityId, unmetCriteriaDetails, { criteriaName, bookingFlow, opportunityType, sellerId }) {
    const typeBucket = CriteriaOrientedOpportunityIdCache.getTypeBucket(cache, {
      criteriaName, bookingFlow, opportunityType,
    });
    if (!typeBucket.contents.has(sellerId)) {
      typeBucket.contents.set(sellerId, new Set());
    }
    const sellerCompartment = typeBucket.contents.get(sellerId);
    // Delete it in case it had previously matched
    sellerCompartment.delete(opportunityId);
    // Ignore errors if criteriaErrors is already hidden
    if (typeBucket.criteriaErrors) {
      // TODO3 here i am
      for (const error of unmetCriteriaDetails) {
        if (!typeBucket.criteriaErrors.has(error)) typeBucket.criteriaErrors.set(error, 0);
        typeBucket.criteriaErrors.set(error, typeBucket.criteriaErrors.get(error) + 1);
      }
    }
  },
};

module.exports = {
  CriteriaOrientedOpportunityIdCache,
};
