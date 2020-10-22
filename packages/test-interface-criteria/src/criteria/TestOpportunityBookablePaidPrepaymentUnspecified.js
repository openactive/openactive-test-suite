const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentUnspecified(offer) {
  return offer.price > 0 && !offer.prepayment;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified
 */
const TestOpportunityBookablePaidPrepaymentUnspecified = createCriteria({
  name: 'TestOpportunityBookablePaidPrepaymentUnspecified',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment unspecified',
      onlyPaidBookableOffersWithPrepaymentUnspecified,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaidPrepaymentUnspecified,
};
