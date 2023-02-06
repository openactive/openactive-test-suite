const { createCriteria, getRemainingCapacity, mustNotBeOpenBookingInAdvanceUnavailable, mustHaveBeInsideValidFromBeforeStartDateWindow } = require('./criteriaUtils');
const { quantitativeValue, shapeConstraintRecipes } = require('../testDataShape');
const { InternalCriteriaFutureScheduledAndDoesNotRequireDetails } = require('./internal/InternalCriteriaFutureScheduledAndDoesNotRequireDetails');

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
  offerConstraints: [
    [
      'openBookingInAdvance of offer must not be `https://openactive.io/Unavailable`',
      mustNotBeOpenBookingInAdvanceUnavailable,
    ],
    [
      'Must be within validFromBeforeStartDate window',
      mustHaveBeInsideValidFromBeforeStartDateWindow,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: {
      // remainingCapacityMustBeZero
      'placeholder:remainingCapacity': quantitativeValue({
        maxinclusive: 0,
      }),
    },
    offerConstraints: {
      ...shapeConstraintRecipes.mustHaveBookableOffer(options),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
});

module.exports = {
  TestOpportunityBookableNoSpaces,
};
