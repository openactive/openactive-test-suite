const { CriteriaFutureScheduledOpportunity } = require('./CriteriaFutureScheduledOpportunity');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustNotHaveAvailableChannel(offer) {
  return !Array.isArray(offer.availableChannel) || !offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityNotBookableViaAvailableChannel
 */
const TestOpportunityNotBookableViaAvailableChannel = createCriteria(
  'TestOpportunityNotBookable',
  [],
  [
    [
      'Must not have available channel',
      mustNotHaveAvailableChannel,
    ],
  ],
  CriteriaFutureScheduledOpportunity,
);

module.exports = {
  TestOpportunityNotBookableViaAvailableChannel,
};

// module.exports = class TestOpportunityNotBookableViaAvailableChannel extends CriteriaFutureScheduledOpportunity {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//       'Must not have available channel': x => !Array.isArray(x.availableChannel)|| !x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"),
//     }
//   }

//   get name() {
//     return 'TestOpportunityNotBookable';
//   }
// }
