const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function offersMustNotHaveCancellationWindow(offer) {
  return !offer.latestCancellationBeforeStartDate;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
const TestOpportunityBookableCancellable = createCriteria(
  'TestOpportunityBookableCancellable',
  [],
  [
    [
      'Offers must not have cancellation window',
      offersMustNotHaveCancellationWindow,
    ],
  ],
  TestOpportunityBookable,
);

module.exports = {
  TestOpportunityBookableCancellable,
};

// module.exports = class TestOpportunityBookableCancellable extends TestOpportunityBookable {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//       'Offers must not have cancellation window': x => !x.latestCancellationBeforeStartDate,
//     }
//   }

//   get name() {
//     return 'TestOpportunityBookableCancellable';
//   }
// }
