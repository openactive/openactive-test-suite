const moment = require('moment');

const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeWithinIt(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return false; // has no booking window
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.validFromBeforeStartDate);

  const valid = start.subtract(duration).isBefore(options.harvestStartTime);
  return valid;
}

const TestOpportunityBookableWithinValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableWithinValidFromBeforeStartDate',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must be within booking window',
      mustHaveBookingWindowAndBeWithinIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalTestOpportunityBookable,
  testDataShape: options => ({
    offerConstraints: {
      'oa:validFromBeforeStartDate': dateRange({
        maxDate: moment(options.harvestStartTime).toISOString(),
      }),
    },
    // validFromMin: moment(options.harvestStartTime).subtract(moment.duration('P28D')).toISOString(),
  }),
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
