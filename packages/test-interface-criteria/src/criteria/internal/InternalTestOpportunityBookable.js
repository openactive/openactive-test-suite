const moment = require('moment');

const { InternalCriteriaFutureScheduledOpportunity } = require('./InternalCriteriaFutureScheduledOpportunity');
const { testOpportunityDataRequirements, quantitativeValue, testOfferDataRequirements, availableChannelArrayConstraint, dateRange, advanceBookingOptionNodeConstraint } = require('../../testDataShape');
const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  remainingCapacityMustBeAtLeastTwo,
  mustHaveBookableOffer,
} = require('../criteriaUtils');

/**
 * @typedef {import('../../types/Criteria').OfferConstraint} OfferConstraint
 */

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
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
  ],
  testDataShape: (options) => ({
    opportunityConstraints: ({
      'placeholder:remainingCapacity': quantitativeValue({
        mininclusive: 2,
      }),
    }),
    offerConstraints: ({
      'schema:availableChannel': availableChannelArrayConstraint({
        includesAll: ['https://openactive.io/OpenBookingPrepayment'],
      }),
      'oa:validFromBeforeStartDate': dateRange({
        minDate: moment(options.harvestStartTime).toISOString(),
        allowNull: true,
      }),
      'oa:advanceBooking': advanceBookingOptionNodeConstraint({
        blocklist: ['https://openactive.io/Unavailable'],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalTestOpportunityBookable,
};
