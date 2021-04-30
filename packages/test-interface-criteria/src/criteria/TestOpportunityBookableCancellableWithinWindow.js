const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustAllowFullRefund, getDateBeforeWhichCancellationsCanBeMade } = require('./criteriaUtils');

/**
 * @type {import('../types/Criteria').OfferConstraint}
 */
function mustBeWithinCancellationWindow(offer, opportunity, options) {
  const dateBeforeWhichCancellationsCanBeMade = getDateBeforeWhichCancellationsCanBeMade(offer, opportunity);
  if (dateBeforeWhichCancellationsCanBeMade == null) {
    return false; // has no cancellation window
  }
  return options.harvestStartTimeTwoHoursLater < dateBeforeWhichCancellationsCanBeMade;
}

/**
 * Note that this criteria will ALWAYS reject any event whose latestCancellationBeforeStartDate
 * duration is less than 2 hours. This is because this will conflict with the
 * `startDateMustBe2HrsInAdvance` constraint (from `InternalCriteriaFutureScheduledOpportunity`).
 *
 * Implements https://openactive.io/test-interface#TestOpportunityBookableCancellableWithinWindow
 */
const TestOpportunityBookableCancellableWithinWindow = createCriteria({
  name: 'TestOpportunityBookableCancellableWithinWindow',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must be within cancellation window',
      mustBeWithinCancellationWindow,
    ],
    [
      'Must allow full refund',
      mustAllowFullRefund,
    ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableWithinWindow,
};
