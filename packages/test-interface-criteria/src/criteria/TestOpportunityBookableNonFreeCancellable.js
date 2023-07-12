const { shapeConstraintRecipes } = require('../testDataShape');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint } = require('./TestOpportunityBookableCancellable');
const { onlyNonFreeBookableOfferConstraint } = require('./TestOpportunityBookableNonFree');
const { createCriteria, mustAllowFullRefundOfferConstraint } = require('./criteriaUtils');

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNonFreeCancellable
 */
const TestOpportunityBookableNonFreeCancellable = createCriteria({
  name: 'TestOpportunityBookableNonFreeCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    onlyNonFreeBookableOfferConstraint,
    mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint,
    mustAllowFullRefundOfferConstraint,
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.onlyNonFreeBookableOffers(),
      ...shapeConstraintRecipes.mustAllowFullRefund(),
      ...shapeConstraintRecipes.mustBeWithinCancellationWindowOrHaveNoWindow(),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNonFreeCancellable,
};
