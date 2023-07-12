const { shapeConstraintRecipes } = require('../testDataShape');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint } = require('./TestOpportunityBookableCancellable');
const { onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint } = require('./TestOpportunityBookableFree');
const { createCriteria, mustAllowFullRefundOfferConstraint } = require('./criteriaUtils');

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFreeCancellable
 */
const TestOpportunityBookableFreeCancellable = createCriteria({
  name: 'TestOpportunityBookableFreeCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    onlyFreeBookableOffersWithUnavailablePrepaymentOfferConstraint,
    mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint,
    mustAllowFullRefundOfferConstraint,
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.onlyFreeBookableOffersWithUnavailablePrepayment(),
      ...shapeConstraintRecipes.mustAllowFullRefund(),
      ...shapeConstraintRecipes.mustBeWithinCancellationWindowOrHaveNoWindow(),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFreeCancellable,
};
