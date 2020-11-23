const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, prepaymentOptionRequirements, FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataRequirements');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentOptional(offer) {
  return offer.price === 0 && offer.prepayment === 'https://openactive.io/Optional';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentOptional
 */
const TestOpportunityBookableFreePrepaymentOptional = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentOptional',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with prepayment Optional',
      onlyFreeBookableOffersWithPrepaymentOptional,
    ],
  ],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:price': FREE_PRICE_QUANTITATIVE_VALUE,
      'test:prepayment': prepaymentOptionRequirements({
        allowlist: ['https://openactive.io/Optional'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentOptional,
};
