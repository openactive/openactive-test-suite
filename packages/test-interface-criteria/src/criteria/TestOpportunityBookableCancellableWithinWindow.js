const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustBeWithinCancellationWindow } = require('./criteriaUtils');

/**
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
