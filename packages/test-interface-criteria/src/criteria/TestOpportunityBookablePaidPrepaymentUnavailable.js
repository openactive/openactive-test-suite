const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentUnavailable(offer) {
  return offer.price > 0 && offer.prepayment === 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnavailable
 */
const TestOpportunityBookablePaidPrepaymentUnavailable = createCriteria({
  name: 'TestOpportunityBookablePaidPrepaymentUnavailable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment unavailable',
      onlyPaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookablePaidPrepaymentUnavailable,
};
