const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { getRemainingCapacity, createCriteria, mustBeWithinBookingWindow } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {Boolean}
 */
function mustBeOutsideBookingWindow(offer, opportunity) {
  return offer.validFromBeforeStartDate && !mustBeWithinBookingWindow(offer, opportunity);
}

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeAtLeastTwo(opportunity) {
  return getRemainingCapacity(opportunity) > 1;
}

const TestOpportunityBookableOutsideValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'Must be outside booking window',
      mustBeOutsideBookingWindow,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
