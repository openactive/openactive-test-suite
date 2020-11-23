const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, NON_FREE_PRICE_QUANTITATIVE_VALUE, prepaymentOptionRequirements } = require('../testDataRequirements');

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
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'test:prepayment': prepaymentOptionRequirements({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableUsingPayment,
};
