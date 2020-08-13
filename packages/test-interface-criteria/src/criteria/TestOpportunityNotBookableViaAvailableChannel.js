const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

/*
  Implements https://openactive.io/test-interface#TestOpportunityNotBookableViaAvailableChannel
*/

module.exports = class TestOpportunityNotBookableViaAvailableChannel extends CriteriaFutureScheduledOpportunity {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
      'Must not have available channel': x => !Array.isArray(x.availableChannel)|| !x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"),
    }
  }

  get name() {
    return 'TestOpportunityNotBookable';
  }
}