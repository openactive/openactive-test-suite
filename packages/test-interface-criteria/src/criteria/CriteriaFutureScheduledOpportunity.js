// const Criteria = require('./Criteria')

/**
 * @typedef {import('../types/Criteria').Criteria} Criteria
 * @typedef {import('../types/Criteria').OpportunityConstraint} OpportunityConstraint
 */

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
 * @type {Pick<Criteria, 'opportunityConstraints' | 'offerConstraints'>}
 */
const CriteriaFutureScheduledOpportunity = {
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
};

module.exports = {
  CriteriaFutureScheduledOpportunity,
};

// module.exports = class CriteriaFutureScheduledOpportunity extends Criteria {
//   get opportunityConstraints() {
//     return {
//       ...super.opportunityConstraints,
//       'Start date must be 2hrs in advance for random tests to use':
//         opportunity => Date.parse(startDate) > (new Date(Date.now() + (3600 * 1000 * 2))).getTime(),
//       'eventStatus must not be Cancelled or Postponed':
//         opportunity => !(opportunity.eventStatus == "https://schema.org/EventCancelled" || opportunity.eventStatus == "https://schema.org/EventPostponed")
//     };
//   }

//   get offerConstraints() {
//     return {
//       ...super.offerConstraints,
//     }
//   }

//   get name() {
//     return 'CriteriaFutureScheduledOpportunity';
//   }
// }
