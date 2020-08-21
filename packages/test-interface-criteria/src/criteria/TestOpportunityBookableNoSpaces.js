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
const TestOpportunityBookableNoSpaces = createCriteria(
  'TestOpportunityBookableNoSpaces',
  [
    [
      'Remaining capacity must be zero',
      remainingCapacityMustBeZero,
    ],
  ],
  [],
  CriteriaFutureScheduledOpportunity,
);

module.exports = {
  TestOpportunityBookableNoSpaces,
};

// module.exports = class TestOpportunityBookableNoSpaces extends CriteriaFutureScheduledOpportunity {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//       'Remaining capacity must be zero': opportunity => this.getRemainingCapacity(opportunity) === 0
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//     }
//   }

//   get name() {
//     return 'TestOpportunityBookableNoSpaces';
//   }
// }
