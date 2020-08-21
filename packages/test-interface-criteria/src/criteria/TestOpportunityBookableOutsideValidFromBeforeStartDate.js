const moment = require('moment');

const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function outsideValidFromBeforeStartDate(offer, opportunity) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
    && offer.advanceBooking !== 'https://openactive.io/Unavailable'
    && (offer.validFromBeforeStartDate && moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isAfter());
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate
 */
const TestOpportunityBookableOutsideValidFromBeforeStartDate = createCriteria(
  'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  [],
  [
    [
      'Outside ValidFromBeforeStartDate',
      outsideValidFromBeforeStartDate,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};

// module.exports = class TestOpportunityBookableOutsideValidFromBeforeStartDate extends TestOpportunityBookable {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//     };
//   }

//   get offerConstraints() {
//     return {
//       'Outside ValidFromBeforeStartDate': (x, opportunity) => (Array.isArray(x.availableChannel) && x.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
//           && x.advanceBooking != 'https://openactive.io/Unavailable'
//           && (x.validFromBeforeStartDate && moment(opportunity.startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isAfter()),
//     };
//   }

//   get name() {
//     return 'TestOpportunityBookableOutsideValidFromBeforeStartDate';
//   }
// };
