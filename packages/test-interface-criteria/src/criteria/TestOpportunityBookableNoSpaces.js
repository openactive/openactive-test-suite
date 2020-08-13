const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableNoSpaces
*/

module.exports = class TestOpportunityBookableNoSpaces extends CriteriaFutureScheduledOpportunity {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
      'Remaining capacity must be zero': opportunity => this.getRemainingCapacity(opportunity) === 0
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
    }
  }

  get name() {
    return 'TestOpportunityBookableNoSpaces';
  }
}