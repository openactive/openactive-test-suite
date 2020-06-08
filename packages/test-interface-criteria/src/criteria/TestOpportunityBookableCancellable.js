const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
*/

module.exports = class TestOpportunityBookableCancellable extends TestOpportunityBookable {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var bookableOffers = this.getBookableOffers(opportunity);

    var offersWithoutCancellationWindow = bookableOffers.filter(x => !x.latestCancellationBeforeStartDate);

    if (
      offersWithoutCancellationWindow.length === 0
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No Offers without cancellation window")
    }

    return {matchesCriteria, unmetCriteriaDetails};
  }

  get name() {
    return 'TestOpportunityBookableCancellable';
  }
}