const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getRemainingCapacity } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeFive(opportunityConstraint) {
  return getRemainingCapacity(opportunityConstraint) === 5;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces
 */
const TestOpportunityBookableFiveSpaces = createCriteria({
  name: 'TestOpportunityBookableFiveSpaces',
  opportunityConstraints: [
    [
      'Remaining capacity must be five',
      remainingCapacityMustBeFive,
    ],
  ],
  offerConstraints: [],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFiveSpaces,
};
