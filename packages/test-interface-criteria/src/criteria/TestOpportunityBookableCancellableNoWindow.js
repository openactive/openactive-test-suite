const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustAllowFullRefund } = require('./criteriaUtils');
const { BLOCKED_FIELD, shapeConstraintRecipes } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function offersMustNotHaveCancellationWindow(offer) {
  return !offer.latestCancellationBeforeStartDate;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellableNoWindow
 */
const TestOpportunityBookableCancellableNoWindow = createCriteria({
  name: 'TestOpportunityBookableCancellableNoWindow',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Offer must not have cancellation window (`latestCancellationBeforeStartDate`)',
      offersMustNotHaveCancellationWindow,
    ],
    [
      'Offer must be fully refundable on customer cancellation, with `"allowCustomerCancellationFullRefund": true`',
      mustAllowFullRefund,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: {
      ...shapeConstraintRecipes.mustAllowFullRefund(),
      // offersMustNotHaveCancellationWindow
      'oa:latestCancellationBeforeStartDate': BLOCKED_FIELD,
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableNoWindow,
};
