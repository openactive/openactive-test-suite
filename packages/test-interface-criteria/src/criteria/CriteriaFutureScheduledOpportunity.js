const Criteria = require('./Criteria')

/*
  Useful base class to filter for future opportunities
*/

module.exports = class CriteriaFutureScheduledOpportunity extends Criteria {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
      'Start date must be 2hrs in advance for random tests to use':
        opportunity => Date.parse(startDate) > (new Date(Date.now() + (3600 * 1000 * 2))).getTime(),
      'eventStatus must not be Cancelled or Postponed':
        opportunity => !(opportunity.eventStatus == "https://schema.org/EventCancelled" || opportunity.eventStatus == "https://schema.org/EventPostponed")
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
    }
  }
  
  get name() {
    return 'CriteriaFutureScheduledOpportunity';
  }
}