const Criteria = require('./Criteria')

/*
  Useful base class to filter for future opportunities
*/

module.exports = class CriteriaFutureScheduledOpportunity extends Criteria {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var startDate = opportunity.startDate;
    var eventStatus = opportunity.eventStatus;

    if (
      !(Date.parse(startDate) > (new Date(Date.now() + (3600 * 1000 * 2))).getTime())
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Start date must be 2hrs in advance for random tests to use")
    }

    if (
      (eventStatus == "https://schema.org/EventCancelled" || eventStatus == "https://schema.org/EventPostponed")
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Cancelled or Postponed")
    }

    return { matchesCriteria, unmetCriteriaDetails }
  }

  get name() {
    return 'CriteriaFutureScheduledOpportunity';
  }
}