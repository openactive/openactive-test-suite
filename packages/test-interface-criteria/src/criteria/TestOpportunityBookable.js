const { createCriteria } = require('./criteriaUtils');
const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');

// TODO this is now redundant

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookable.
 *
 * Note that this differs from the above by forbidding Minimal Proposal Flow
 * offers. This means that tests written for this criteria can focus on
 * Simple Booking Flow scenarios.
 */
const TestOpportunityBookable = createCriteria({
  name: 'TestOpportunityBookable',
  opportunityConstraints: [],
  offerConstraints: [],
  testDataShape: () => ({}),
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookable,
};
