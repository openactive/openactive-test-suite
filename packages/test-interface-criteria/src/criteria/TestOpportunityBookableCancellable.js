const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustAllowFullRefund, getDateBeforeWhichCancellationsCanBeMade } = require('./criteriaUtils');
const { BLOCKED_FIELD, shapeConstraintRecipes } = require('../testDataShape');

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

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
 */
const TestOpportunityBookableCancellable = createCriteria({
  name: 'TestOpportunityBookableCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Offer must not have cancellation window (`latestCancellationBeforeStartDate`), or be within the cancellation window',
      mustBeWithinCancellationWindowOrHaveNoWindow,
    ],
    [
      'Offer must be fully refundable on customer cancellation, with `"allowCustomerCancellationFullRefund": true`',
      mustAllowFullRefund,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.mustAllowFullRefund(),
      // mustBeWithinCancellationWindowOrHaveNoWindow
      'oa:latestCancellationBeforeStartDate': BLOCKED_FIELD,
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellable,
};
