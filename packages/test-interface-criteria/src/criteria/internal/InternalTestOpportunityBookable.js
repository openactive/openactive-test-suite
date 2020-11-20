const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('./InternalCriteriaFutureScheduledOpportunity');
const { remainingCapacityMustBeAtLeastTwo, createCriteria } = require('../criteriaUtils');
const { testOpportunityDataRequirements, quantitativeValue, testOfferDataRequirements, arrayRequirements, availableChannelArrayRequirements, dateRange, advanceBookingOptionRequirements } = require('../../testDataRequirements');

/**
 * @typedef {import('../../types/Criteria').OfferConstraint} OfferConstraint
 */

/**
 * @type {OfferConstraint}
 */
function mustHaveBookableOffer(offer, opportunity, options) {
  return (Array.isArray(offer.availableChannel) && offer.availableChannel.includes('https://openactive.io/OpenBookingPrepayment'))
    && offer.advanceBooking !== 'https://openactive.io/Unavailable'
    && (!offer.validFromBeforeStartDate || moment(opportunity.startDate).subtract(moment.duration(offer.validFromBeforeStartDate)).isBefore(options.harvestStartTime));
}

/**
 * Internal criteria which almost implements https://openactive.io/test-interface#TestOpportunityBookable
 * but handily leaves out anything related to openBookingFlowRequirement, so
 * that bookable criteria for Simple Booking Flow, Minimal Proposal Flow,
 * and Proposal Amendment flow can be generated using this
 */
const InternalTestOpportunityBookable = createCriteria({
  name: '_InternalTestOpportunityBookable',
  opportunityConstraints: [
    [
      'Remaining capacity must be at least two (or one for IndividualFacilityUse)',
      remainingCapacityMustBeAtLeastTwo,
    ],
  ],
  offerConstraints: [
    [
      'Must have "bookable" offer',
      mustHaveBookableOffer,
    ],
  ],
  testDataRequirements: (options) => ({
    'test:testOpportunityDataRequirements': testOpportunityDataRequirements({
      'test:remainingCapacity': quantitativeValue({
        minValue: 2,
      }),
    }),
    'test:testOfferDataRequirements': testOfferDataRequirements({
      'test:availableChannel': availableChannelArrayRequirements({
        includesAll: ['https://openactive.io/OpenBookingPrepayment'],
      }),
      'test:validFrom': dateRange({
        minValue: moment(options.harvestStartTime).toISOString(),
        allowNull: true,
      }),
      'test:advanceBooking': advanceBookingOptionRequirements({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalTestOpportunityBookable,
};
