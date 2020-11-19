const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { createCriteria, getRemainingCapacity } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeZero(opportunity) {
  return getRemainingCapacity(opportunity) === 0;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableNoSpaces
 */
const TestOpportunityBookableNoSpaces = createCriteria({
  name: 'TestOpportunityBookableNoSpaces',
  opportunityConstraints: [
    [
      'Remaining capacity must be zero',
      remainingCapacityMustBeZero,
    ],
  ],
  offerConstraints: [],
  testDataRequirements: (options) => ({
    remainingCapacityMax: 0,
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookableNoSpaces,
};
