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
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable
 */
const TestOpportunityBookableNonFreePrepaymentUnavailable = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentUnavailable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment unavailable',
      onlyPaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  testDataRequirements: () => ({
    priceBlocklist: [0],
    prepaymentAllowlist: ['https://openactive.io/Unavailable'],
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentUnavailable,
};
