const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getDateBeforeWhichCancellationsCanBeMade, createCriteriaOfferConstraint, mustAllowFullRefundOfferConstraint } = require('./criteriaUtils');
const { shapeConstraintRecipes } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {import('../types/Criteria').OfferConstraint}
 */
function mustBeWithinCancellationWindowOrHaveNoWindow(offer, opportunity, options) {
  const dateBeforeWhichCancellationsCanBeMade = getDateBeforeWhichCancellationsCanBeMade(offer, opportunity);
  if (dateBeforeWhichCancellationsCanBeMade == null) {
    return true; // has no cancellation window
  }
  return options.harvestStartTimeTwoHoursLater < dateBeforeWhichCancellationsCanBeMade;
}

const mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint = createCriteriaOfferConstraint(
  'Offer must not have cancellation window (`latestCancellationBeforeStartDate`), or be within the cancellation window',
  mustBeWithinCancellationWindowOrHaveNoWindow,
);

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
const TestOpportunityBookableCancellable = createCriteria({
  name: 'TestOpportunityBookableCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint,
    mustAllowFullRefundOfferConstraint,
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.mustAllowFullRefund(),
      ...shapeConstraintRecipes.mustBeWithinCancellationWindowOrHaveNoWindow(),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellable,
  mustBeWithinCancellationWindowOrHaveNoWindowOfferConstraint,
};
