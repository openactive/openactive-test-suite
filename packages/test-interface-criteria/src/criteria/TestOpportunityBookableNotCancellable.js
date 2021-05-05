const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, mustNotAllowFullRefund } = require('./criteriaUtils');
const { FALSE_BOOLEAN_CONSTRAINT } = require('../testDataShape');

/**
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
  testDataShape: () => ({
    offerConstraints: {
      // mustNotAllowFullRefund
      'oa:allowCustomerCancellationFullRefund': FALSE_BOOLEAN_CONSTRAINT,
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableNotCancellable,
};
