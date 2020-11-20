const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { testOfferDataRequirements, quantitativeValue } = require('../testDataRequirements');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyNonFreeBookableOffers(offer) {
  return offer.price > 0;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFree
 */
const TestOpportunityBookableNonFree = createCriteria({
  name: 'TestOpportunityBookableNonFree',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Only non-free bookable Offers',
      onlyNonFreeBookableOffers,
    ],
  ],
  testDataRequirements: () => ({
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:price': quantitativeValue({
        minValue: 0.01,
      }),
    }),
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFree,
};
