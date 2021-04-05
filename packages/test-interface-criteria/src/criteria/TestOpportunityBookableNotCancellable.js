const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustNotAllowFullRefund } = require('./criteriaUtils');

/**
 *
 *
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNotCancellable
 */
const TestOpportunityBookableNotCancellable = createCriteria({
  name: 'TestOpportunityBookableNotCancellable',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must not allow customer cancellation full refund',
      mustNotAllowFullRefund,
    ],
  ],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNotCancellable,
};
