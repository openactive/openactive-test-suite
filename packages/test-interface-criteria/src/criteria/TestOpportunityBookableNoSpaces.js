const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableNoSpaces
*/

module.exports = class TestOpportunityBookableNoSpaces extends CriteriaFutureScheduledOpportunity {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var id = this.getId(opportunity);
    var type = this.getType(opportunity);

    // Check for bookability
    var bookableOffers = this.getBookableOffers(opportunity);
    var remainingCapacity = this.getRemainingCapacity(opportunity);

    if (
      !(bookableOffers.length > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No bookable Offers")
    }

    if (
      !(remainingCapacity == 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Remaining capacity is non-zero")
    }

    return { matchesCriteria, unmetCriteriaDetails }
  }

  get name() {
    return 'TestOpportunityBookableNoSpaces';
  }
}