const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, prepaymentOptionRequirements, NON_FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataRequirements');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyPaidBookableOffersWithPrepaymentOptional(offer) {
  return offer.price > 0 && offer.prepayment === 'https://openactive.io/Optional';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional
 */
const TestOpportunityBookableNonFreePrepaymentOptional = createCriteria({
  name: 'TestOpportunityBookableNonFreePrepaymentOptional',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only paid bookable offers with prepayment optional',
      onlyPaidBookableOffersWithPrepaymentOptional,
    ],
  ],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
      'test:prepayment': prepaymentOptionRequirements({
        allowlist: ['https://openactive.io/Optional'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreePrepaymentOptional,
};
