const {
  createCriteria,
  getRemainingCapacity,
  mustNotBeOpenBookingInAdvanceUnavailable,
  mustBeInsideBookingWindowIfOneExists,
  sellerMustAllowOpenBooking,
} = require('./criteriaUtils');
const {
  shapeConstraintRecipes, quantitativeValue,
} = require('../testDataShape');
const { InternalCriteriaFutureScheduledAndDoesNotRequireDetails } = require('./internal/InternalCriteriaFutureScheduledAndDoesNotRequireDetails');

/**
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * @type {OpportunityConstraint}
 */
function remainingCapacityMustBeOne(opportunity) {
  return getRemainingCapacity(opportunity) === 1;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableOneSpace
 */
const TestOpportunityBookableOneSpace = createCriteria({
  name: 'TestOpportunityBookableOneSpace',
  opportunityConstraints: [
    [
      'Remaining capacity must be 1',
      remainingCapacityMustBeOne,
    ],
    [
      'organizer or provider must include isOpenBookingAllowed = true',
      sellerMustAllowOpenBooking,
    ],
  ],
  offerConstraints: [
    [
      'openBookingInAdvance of offer must not be `https://openactive.io/Unavailable`',
      mustNotBeOpenBookingInAdvanceUnavailable,
    ],
    [
      'Must be within the booking window (`validFromBeforeStartDate` and/or `validThroughBeforeStartDate`) if one exists',
      mustBeInsideBookingWindowIfOneExists,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: {
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 1,
        maxinclusive: 1,
      }),
      'placeholder:remainingCapacityIfuSlot': quantitativeValue({
        mininclusive: 1,
        maxinclusive: 1,
      }),
      ...shapeConstraintRecipes.sellerMustAllowOpenBooking(),
    },
    offerConstraints: {
      ...shapeConstraintRecipes.mustHaveBookableOffer(options),
    },
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
});

module.exports = {
  TestOpportunityBookableOneSpace,
};
