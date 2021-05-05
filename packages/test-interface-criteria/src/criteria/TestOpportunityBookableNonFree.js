const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { NON_FREE_PRICE_QUANTITATIVE_VALUE } = require('../testDataShape');

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
  testDataShape: () => ({
    offerConstraints: {
      // onlyNonFreeBookableOffers
      'schema:price': NON_FREE_PRICE_QUANTITATIVE_VALUE,
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFree,
};
