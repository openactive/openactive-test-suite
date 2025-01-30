const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, createCriteriaOfferConstraint } = require('./criteriaUtils');
const { shapeConstraintRecipes } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function onlyNonFreeBookableOffers(offer) {
  return offer.price > 0;
}

const onlyNonFreeBookableOfferConstraint = createCriteriaOfferConstraint(
  'Only non-free bookable Offers',
  onlyNonFreeBookableOffers,
);

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFree
 */
const TestOpportunityBookableNonFree = createCriteria({
  name: 'TestOpportunityBookableNonFree',
  opportunityConstraints: [],
  offerConstraints: [
    onlyNonFreeBookableOfferConstraint,
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.onlyNonFreeBookableOffers(),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFree,
  onlyNonFreeBookableOfferConstraint,
};
