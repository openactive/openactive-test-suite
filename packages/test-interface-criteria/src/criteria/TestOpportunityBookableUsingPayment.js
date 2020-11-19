const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffers(offer) {
  return offer.price > 0 && offer.prepayment !== 'https://openactive.io/Unavailable';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableUsingPayment
 */
const TestOpportunityBookableUsingPayment = createCriteria({
  name: 'TestOpportunityBookableUsingPayment',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable Offers, where prepayment is not Unavailable',
      onlyPaidBookableOffers,
    ],
  ],
  testDataRequirements: (options) => ({
    priceBlocklist: [0],
    prepaymentBlocklist: ['https://openactive.io/Unavailable'],
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableUsingPayment,
};
