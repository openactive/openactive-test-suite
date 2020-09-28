const moment = require('moment');

const { CriteriaFutureScheduledOpportunity } = require('./CriteriaFutureScheduledOpportunity');
const { getRemainingCapacity, createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeNonZero(opportunity) {
  return getRemainingCapacity(opportunity) > 0;
}

/**
 * @type {OfferConstraint}
 */
function mustHaveBookableOffer(offer, opportunity) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
    && offer.advanceBooking !== 'https://openactive.io/Unavailable'
    && (!offer.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isBefore());
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable
 */
const TestOpportunityBookable = createCriteria({
  name: 'TestOpportunityBookable',
  opportunityConstraints: [
    [
      'Remaining capacity must be non-zero',
      remainingCapacityMustBeNonZero,
    ],
  ],
  offerConstraints: [
    [
      'Must have "bookable" offer',
      mustHaveBookableOffer,
    ],
  ],
  includeConstraintsFromCriteria: CriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookable,
};
