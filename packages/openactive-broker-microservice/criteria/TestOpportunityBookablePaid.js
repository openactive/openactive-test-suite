const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookablePaid
*/

module.exports = class TestOpportunityBookablePaid extends TestOpportunityBookable {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var bookableOffers = this.getBookableOffers(opportunity);

    var paidBookableOffers = bookableOffers.filter(x => x.price > 0);

    if (
      !(paidBookableOffers.length > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No paid bookable Offers")
    }

    return {matchesCriteria, unmetCriteriaDetails};
  }

  get name() {
    return 'TestOpportunityBookablePaid';
  }
}