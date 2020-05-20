const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

module.exports = class TestOpportunityNotBookable extends CriteriaFutureScheduledOpportunity {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var id = this.getId(opportunity);
    var type = this.getType(opportunity);

    // Check for bookability
    var bookableOffers = this.getBookableOffers(opportunity);
    var remainingCapacity = this.getRemainingCapacity(opportunity);

    if (
      (bookableOffers.length > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Contains bookable Offers")
    }

    if (
      !(remainingCapacity > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No remaining capacity")
    }

    return { matchesCriteria, unmetCriteriaDetails }
  }

  get name() {
    return 'TestOpportunityNotBookable';
  }
}