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
const TestOpportunityBookable = createCriteria(
  'TestOpportunityBookable',
  [
    [
      'Remaining capacity must be non-zero',
      remainingCapacityMustBeNonZero,
    ],
  ],
  [
    [
      'Must have "bookable" offer',
      mustHaveBookableOffer,
    ],
  ],
  CriteriaFutureScheduledOpportunity,
);

module.exports = {
  TestOpportunityBookable,
};

// module.exports = class TestOpportunityBookable extends CriteriaFutureScheduledOpportunity {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//       'Remaining capacity must be non-zero': opportunity => this.getRemainingCapacity(opportunity) > 0,
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//       'Must have "bookable" offer': (x, opportunity) => (Array.isArray(x.availableChannel) && x.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
//         && x.advanceBooking != 'https://openactive.io/Unavailable'
//         && (!x.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore()),
//     };
//   }

//   get name() {
//     return 'TestOpportunityBookable';
//   }
// };
