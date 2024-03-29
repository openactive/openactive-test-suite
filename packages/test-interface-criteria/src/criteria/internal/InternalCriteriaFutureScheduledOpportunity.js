const {
  shapeConstraintRecipes,
} = require('../../testDataShape');

/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

const {
  createCriteria,
  startDateMustBeOver2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
  excludePaidBookableOffersWithPrepaymentUnavailable,
} = require('../criteriaUtils');

/**
 * Useful base constraints for future opportunities.
 *
 * This shouldn't be used for any tests, as it is not an [official criteria](https://openactive.io/test-interface/).
 * It's just a useful basis for other criteria to include constraints from.
 */
const InternalCriteriaFutureScheduledOpportunity = createCriteria({
  name: '_InternalCriteriaFutureScheduledOpportunity',
  opportunityConstraints: [
    [
      'startDate must be over 2hrs in advance for random tests to use',
      startDateMustBeOver2HrsInAdvance,
    ],
    [
      'eventStatus must not be Cancelled or Postponed',
      eventStatusMustNotBeCancelledOrPostponed,
    ],
  ],
  offerConstraints: [
    [
      'Offer must not be non-free with openBookingPrepayment unavailable',
      excludePaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: ({
      ...shapeConstraintRecipes.startDateMustBe2HrsInAdvance(options),
      ...shapeConstraintRecipes.eventStatusMustNotBeCancelledOrPostponed(),
    }),
  }),
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
