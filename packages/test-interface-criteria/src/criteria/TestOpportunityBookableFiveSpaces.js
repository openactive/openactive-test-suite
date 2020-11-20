const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getRemainingCapacity } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeFive(opportunity) {
  return getRemainingCapacity(opportunity) === 5;
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
  testDataRequirements: () => ({
    remainingCapacityMin: 5,
    remainingCapacityMax: 5,
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFiveSpaces,
};
