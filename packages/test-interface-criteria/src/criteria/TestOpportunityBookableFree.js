const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableFree
*/

module.exports = class TestOpportunityBookableFree extends TestOpportunityBookable {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
      'Only free bookable Offers': x => x.price === 0,
    }
  }
  
  get name() {
    return 'TestOpportunityBookableFree';
  }
}