/**
 * @typedef {import('../../types/Criteria').Criteria} Criteria
 * @typedef {import('../../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

const { createCriteria } = require('../criteriaUtils');

/**
 * @type {OpportunityConstraint}
 */
function startDateMustBe2HrsInAdvance(opportunity) {
  const in2HrsTimestamp = (new Date(Date.now() + (3600 * 1000 * 2))).getTime();
  return Date.parse(opportunity.startDate) > in2HrsTimestamp;
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
});

module.exports = {
  InternalCriteriaFutureScheduledOpportunity,
};
