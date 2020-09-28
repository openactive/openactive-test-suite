const { CriteriaFutureScheduledOpportunity } = require('./CriteriaFutureScheduledOpportunity');
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
  includeConstraintsFromCriteria: CriteriaFutureScheduledOpportunity,
});

module.exports = {
  TestOpportunityBookableNoSpaces,
};
