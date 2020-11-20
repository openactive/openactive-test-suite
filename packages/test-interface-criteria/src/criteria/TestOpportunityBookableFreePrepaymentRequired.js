const { testOfferDataRequirements, quantitativeValue, prepaymentOptionRequirements } = require('../testDataRequirements');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyFreeBookableOffersWithPrepaymentRequired(offer) {
  return offer.price === 0 && offer.prepayment === 'https://openactive.io/Required';
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentRequired
 */
const TestOpportunityBookableFreePrepaymentRequired = createCriteria({
  name: 'TestOpportunityBookableFreePrepaymentRequired',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only free bookable offers with prepayment Required',
      onlyFreeBookableOffersWithPrepaymentRequired,
    ],
  ],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:price': quantitativeValue({
        maxValue: 0,
      }),
      'test:prepayment': prepaymentOptionRequirements({
        allowlist: ['https://openactive.io/Required'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreePrepaymentRequired,
};
