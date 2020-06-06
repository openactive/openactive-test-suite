const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

/*
  Implements https://openactive.io/test-interface#TestOpportunityNotBookableViaAvailableChannel
*/

module.exports = class TestOpportunityNotBookableViaAvailableChannel extends CriteriaFutureScheduledOpportunity {
  getOffersWithoutAvailableChannel(opportunity) {
		const offers = this.getOffers(opportunity);
		return offers ? offers.filter(x =>
			(!x.availableChannel || !x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
		) : [];
  }
  
  testMatch(opportunity) {
    let {matchesCriteria, unmetCriteriaDetails} = super.testMatch(opportunity);

    // Check for bookability
    var offersWithoutAvailableChannel = this.getOffersWithoutAvailableChannel(opportunity);

    if (
      (offersWithoutAvailableChannel.length === 0)
    ) {
      matchesCriteria = false;
      unmetCriteriaDetails.push("Does not contain offers without available channel")
    }

    return { matchesCriteria, unmetCriteriaDetails }
  }

  get name() {
    return 'TestOpportunityNotBookable';
  }
}