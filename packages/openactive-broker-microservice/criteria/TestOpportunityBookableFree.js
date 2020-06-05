const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableFree
*/

module.exports = class TestOpportunityBookableFree extends TestOpportunityBookable {
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    var bookableOffers = this.getBookableOffers(opportunity);

    var freeBookableOffers = bookableOffers.filter(x => x.price === 0);

    if (
      !(freeBookableOffers.length > 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("No free bookable Offers")
    }

    return {matchesCriteria, unmetCriteriaDetails};
  }

  get name() {
    return 'TestOpportunityBookableFree';
  }
}