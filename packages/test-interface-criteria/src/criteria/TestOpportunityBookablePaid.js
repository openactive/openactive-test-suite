const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookablePaid
*/

module.exports = class TestOpportunityBookablePaid extends TestOpportunityBookable {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
      'Only paid bookable Offers': x => x.price > 0,
    }
  }

  get name() {
    return 'TestOpportunityBookablePaid';
  }
}