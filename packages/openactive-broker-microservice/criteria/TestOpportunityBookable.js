const Criteria = require('./Criteria')

module.exports = class TestOpportunityBookable extends Criteria {
  testMatch(opportunity) {
    var id = this.getId(opportunity);
    var type = this.getType(opportunity);

    // Check for bookability
    var startDate = opportunity.startDate;
    var bookableOffers = this.getBookableOffers(opportunity);
    var remainingCapacity = this.getRemainingCapacity(opportunity);
    var eventStatus = opportunity.eventStatus;

    var matchesCriteria = true;
    var unmetCriteriaDetails = [];

    if (
      !(Date.parse(startDate) > new Date(Date.now() + (3600 * 1000 * 2)))
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Start date must be 2hrs in advance for random tests to use")
    }

    if (
      !(bookableOffers.length > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No bookable Offers")
    }

    if (
      !(remainingCapacity > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No remaining capacity")
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
    return 'TestOpportunityBookable';
  }
}