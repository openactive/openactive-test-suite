const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('./internal/InternalCriteriaFutureScheduledOpportunity');
const { remainingCapacityMustBeAtLeastTwo, createCriteria } = require('./criteriaUtils');

/**
 * @typedef {import('../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustBeOutsideBookingWindow(offer, opportunity, options) {
  if (!offer || !offer.validFromBeforeStartDate) {
    return null; // Required for validation step
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
      'Remaining capacity must be at least two',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'Must be outside booking window',
      mustBeOutsideBookingWindow,
    ],
  ],
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
  testDataHints: (options) => ({
    validFromNull: false,
    validFromMin: moment(options.harvestStartTime).add(moment.duration('P2H')).toISOString(),
    validFromMax: moment(options.harvestStartTime).add(moment.duration('P28D')).toISOString(),
  }),
});

module.exports = {
  TestOpportunityBookableOutsideValidFromBeforeStartDate,
};
