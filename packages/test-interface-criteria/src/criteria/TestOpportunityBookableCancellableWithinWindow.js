const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustBeWithinCancellationWindow } = require('./criteriaUtils');

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
  ],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableCancellableWithinWindow,
};
