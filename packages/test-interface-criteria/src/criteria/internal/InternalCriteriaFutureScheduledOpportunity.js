const moment = require('moment');
const {
  // EVENT_STATUS_EVENT_CANCELLED,
  // EVENT_STATUS_EVENT_POSTPONED,
  testOpportunityDataRequirements,
  dateRange,
  optionRequirements,
} = require('../../testDataRequirements');

/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

const { createCriteria } = require('../criteriaUtils');

/**
 * @type {OpportunityConstraint}
 */
function startDateMustBe2HrsInAdvance(opportunity, options) {
  return moment(options.harvestStartTime).add(moment.duration('P2H')).isBefore(opportunity.startDate);
}

/**
 * @type {OpportunityConstraint}
 */
function eventStatusMustNotBeCancelledOrPostponed(opportunity) {
  return !(opportunity.eventStatus === 'https://schema.org/EventCancelled' || opportunity.eventStatus === 'https://schema.org/EventPostponed');
}

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
  offerConstraints: [],
  testDataRequirements: (options) => ({
    'test:testOpportunityDataRequirements': testOpportunityDataRequirements({
      'test:startDate': dateRange({
        minRange: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
      }),
      // 'test:eventStatus': {
      //   '@type': 'test:OptionRequirements',
      //   valueType: 'schema:EventStatusType',
      //   blocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
      // },
      'test:eventStatus': optionRequirements({
        valueType: 'schema:EventStatusType',
        // blocklist: /** @type {import('../../types/TestDataRequirements').EventStatusType[]} */(['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed']),
        blocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
        // blocklist: [EVENT_STATUS_EVENT_CANCELLED, EVENT_STATUS_EVENT_POSTPONED],
      }),
    }),
    // startDateMin: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
    // eventStatusBlocklist: ['https://schema.org/EventCancelled', 'https://schema.org/EventPostponed'],
  }),
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
