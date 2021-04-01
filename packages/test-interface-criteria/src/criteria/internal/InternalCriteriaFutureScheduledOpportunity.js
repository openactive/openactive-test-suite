const moment = require('moment');
const {
  // EVENT_STATUS_EVENT_CANCELLED,
  // EVENT_STATUS_EVENT_POSTPONED,
  testOpportunityDataShapeExpression,
  dateRange,
  eventStatusOptionNodeConstraint,
} = require('../../testDataShape');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  startDateMustBe2HrsInAdvance,
  eventStatusMustNotBeCancelledOrPostponed,
} = require('../criteriaUtils');

/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

/**
 * Useful base filters for future opportunities
 */
const InternalCriteriaFutureScheduledOpportunity = createCriteria({
  name: '_InternalCriteriaFutureScheduledOpportunity',
  opportunityConstraints: [
    [
      'Start date must be 2hrs in advance for random tests to use',
      startDateMustBe2HrsInAdvance,
    ],
    [
      'eventStatus must not be Cancelled or Postponed',
      eventStatusMustNotBeCancelledOrPostponed,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: ({
      'test:startDate': dateRange({
        minDate: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
      }),
      'schema:eventStatus': eventStatusOptionNodeConstraint({
        blocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
      }),
    }),
  }),
  offerConstraints: [
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
  ],
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
