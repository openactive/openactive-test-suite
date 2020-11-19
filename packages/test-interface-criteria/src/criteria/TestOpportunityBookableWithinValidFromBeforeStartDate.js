const moment = require('moment');

const { InternalTestOpportunityBookable } = require('./internal/InternalTestOpportunityBookable');
const { createCriteria } = require('./criteriaUtils');

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
  testDataRequirements: (options) => ({
    // validFromNull: false,
    // validFromMin: moment(options.harvestStartTime).subtract(moment.duration('P28D')).toISOString(),
    validFromMax: moment(options.harvestStartTime).toISOString(),
  }),
});

module.exports = {
  TestOpportunityBookableWithinValidFromBeforeStartDate,
};
