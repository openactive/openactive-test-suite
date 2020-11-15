const moment = require('moment');

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
  testDataHints: (options) => ({
    startDateMin: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
    eventStatusOptions: ['https://schema.org/EventScheduled'],
  }),
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
