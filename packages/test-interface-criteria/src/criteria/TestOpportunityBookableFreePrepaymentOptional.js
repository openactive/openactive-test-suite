const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, quantitativeValue, prepaymentOptionRequirements } = require('../testDataRequirements');

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
      'test:price': quantitativeValue({
        maxValue: 0,
      }),
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
