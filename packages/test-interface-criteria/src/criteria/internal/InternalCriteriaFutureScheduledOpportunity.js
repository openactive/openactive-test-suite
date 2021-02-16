const moment = require('moment');
const {
  // EVENT_STATUS_EVENT_CANCELLED,
  // EVENT_STATUS_EVENT_POSTPONED,
  testOpportunityDataRequirements,
  dateRange,
  eventStatusOptionRequirements,
} = require('../../testDataRequirements');
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
  testDataRequirements: (options) => ({
    'test:testOpportunityDataRequirements': testOpportunityDataRequirements({
      'test:startDate': dateRange({
        minDate: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
      }),
      'test:eventStatus': eventStatusOptionRequirements({
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
