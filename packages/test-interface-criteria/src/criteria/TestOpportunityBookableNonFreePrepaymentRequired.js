const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentRequired(offer) {
  return offer.price > 0 && (!offer.prepayment || offer.prepayment === 'https://openactive.io/Required');
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired
 */
const TestOpportunityBookableNonFreePrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment required',
      onlyPaidBookableOffersWithPrepaymentRequired,
    ],
  ],
  testDataRequirements: () => ({
    priceBlocklist: [0],
    prepaymentAllowlist: ['https://openactive.io/Required'],
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentRequired,
};
