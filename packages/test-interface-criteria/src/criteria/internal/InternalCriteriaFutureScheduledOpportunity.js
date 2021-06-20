const {
  dateRange,
  eventStatusOptionNodeConstraint,
} = require('../../testDataShape');

/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

const {
  createCriteria,
  startDateMustBe2HrsInAdvance,
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
      'startDate must be 2hrs in advance for random tests to use',
      startDateMustBe2HrsInAdvance,
    ],
    [
      'eventStatus must not be Cancelled or Postponed',
      eventStatusMustNotBeCancelledOrPostponed,
    ],
    [
      'Offer must not be non-free with openBookingPrepayment unavailable',
      excludePaidBookableOffersWithPrepaymentUnavailable,
    ],
  ],
  offerConstraints: [],
  testDataShape: (options) => ({
    opportunityConstraints: ({
      // startDateMustBe2HrsInAdvance
      'schema:startDate': dateRange({
        minDate: options.harvestStartTimeTwoHoursLater.toISO(),
      }),
      // eventStatusMustNotBeCancelledOrPostponed
      'schema:eventStatus': eventStatusOptionNodeConstraint({
        blocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
      }),
    }),
  }),
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
