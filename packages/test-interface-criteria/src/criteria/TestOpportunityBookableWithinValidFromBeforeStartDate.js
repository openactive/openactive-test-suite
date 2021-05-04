const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { createCriteria, getDateAfterWhichBookingsCanBeMade } = require('./criteriaUtils');
const { dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookingWindowAndBeWithinIt(offer, opportunity, options) {
  const dateAfterWhichBookingsCanBeMade = getDateAfterWhichBookingsCanBeMade(offer, opportunity);
  if (dateAfterWhichBookingsCanBeMade == null) {
    return false; // has no booking window
  }
  return options.harvestStartTime > dateAfterWhichBookingsCanBeMade;
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
  testDataShape: (options) => ({
    offerConstraints: {
      'oa:validFromBeforeStartDate': dateRange({
        maxDate: options.harvestStartTime.toISO(),
        // maxDate: moment(options.harvestStartTime).toISOString(),
      }),
    },
  }),
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
