const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableCancellable
*/

module.exports = class TestOpportunityBookableCancellable extends TestOpportunityBookable {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
      'Offers must not have cancellation window': x => !x.latestCancellationBeforeStartDate,
    }
  }

  get name() {
    return 'TestOpportunityBookableCancellable';
  }
}