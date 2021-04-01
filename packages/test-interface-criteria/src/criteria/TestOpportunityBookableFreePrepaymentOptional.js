const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { prepaymentOptionNodeConstraint, FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

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
  testDataShape: () => ({
    offerConstraints: {
      'schema:price': FREE_PRICE_QUANTITATIVE_VALUE,
      'oa:prepayment': prepaymentOptionNodeConstraint({
        allowlist: ['https://openactive.io/Optional'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentOptional,
};
