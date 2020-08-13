const moment = require('moment');

const CriteriaFutureScheduledOpportunity = require('./CriteriaFutureScheduledOpportunity')

/*
  Implements https://openactive.io/test-interface#TestOpportunityBookable
*/

module.exports = class TestOpportunityBookable extends CriteriaFutureScheduledOpportunity {
  get opportunityConstraints() {
    return {
      ...super.opportunityConstraints,
      'Remaining capacity must be non-zero': opportunity => this.getRemainingCapacity(opportunity) > 0
    };
  }

  get offerConstraints() {
    return {
      ...super.offerConstraints,
      'Must have "bookable" offer': (x, opportunity) =>
        (Array.isArray(x.availableChannel) && x.availableChannel.includes("https://openactive.io/OpenBookingPrepayment"))
        && x.advanceBooking != "https://openactive.io/Unavailable"
        && (!x.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(x.validFromBeforeStartDate)).isBefore())
    }
  }

  get name() {
    return 'TestOpportunityBookable';
  }
}