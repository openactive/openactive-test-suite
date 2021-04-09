const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { remainingCapacityMustBeAtLeastTwo, createCriteria } = require('./criteriaUtils');
const { quantitativeValue, dateRange } = require('../testDataShape');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function musHaveBookingWindowAndBeOutsideOfIt(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return false; // has no booking window
  }

  const start = moment(opportunity.startDate);
  const duration = moment.duration(offer.validFromBeforeStartDate);

  // This constraint needs to stay valid for 2 hours
  const valid = start.subtract(duration).add('PT2H').isAfter(options.harvestStartTime);
  return valid;
}

/**
 * Implements https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate
 */
const TestOpportunityBookableOutsideValidFromBeforeStartDate = createCriteria({
  name: 'TestOpportunityBookableOutsideValidFromBeforeStartDate',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'Must be outside booking window',
      musHaveBookingWindowAndBeOutsideOfIt,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
  testDataShape: options => ({
    opportunityConstraints: {
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
    },
    offerConstraints: {
      'oa:validFromBeforeStartDate': dateRange({
        minDate: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
      }),
    },
    // remainingCapacityMin: 2,
    // validFromMin: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
    // validFromMax: moment(options.harvestStartTime).add(moment.duration('P28D')).toISOString(),
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
