const moment = require('moment');

const TestOpportunityBookable = require('./TestOpportunityBookable')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate
*/

module.exports = class TestOpportunityBookableOutsideValidFromBeforeStartDate extends TestOpportunityBookable {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
    };
  }

  get offerConstraints() {
    return {
      'Outside ValidFromBeforeStartDate': (x, opportunity) => 
        (Array.isArray(x.availableChannel) && x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
          && x.advanceBooking != "https://openactive.io/Unavailable"
          && (x.validFromBeforeStartDate && moment(opportunity.startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isAfter()),
    }
  }

  get name() {
    return 'TestOpportunityBookableOutsideValidFromBeforeStartDate';
  }
}