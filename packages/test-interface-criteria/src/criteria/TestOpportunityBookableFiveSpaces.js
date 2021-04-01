const { TestOpportunityBookable } = require('./TestOpportunityBookable');
const { createCriteria, getRemainingCapacity } = require('./criteriaUtils');
const { quantitativeValue } = require('../testDataShape');

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
  testDataShape: () => ({
    opportunityConstraints: {
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 5,
        maxinclusive: 5,
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityBookableFiveSpaces,
};
