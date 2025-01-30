const {
  createCriteria,
  mustNotRequireAttendeeDetails,
  mustNotRequireAdditionalDetails,
} = require('../criteriaUtils');
const { openBookingFlowRequirementArrayConstraint } = require('../../testDataShape');
const { InternalCriteriaFutureScheduledOpportunity } = require('./InternalCriteriaFutureScheduledOpportunity');

/**
 * An opportunity which occurs in the future and does not require additional/attendee details
 *
 * This shouldn't be used for any tests, as it is not an [official criteria](https://openactive.io/test-interface/).
 * It's just a useful basis for other criteria to include constraints from.
 */
const InternalCriteriaFutureScheduledAndDoesNotRequireDetails = createCriteria({
  name: '_InternalCriteriaFutureScheduledAndDoesNotRequireDetails',
  opportunityConstraints: [],
  offerConstraints: [
    [
      'Must not require attendee details',
      mustNotRequireAttendeeDetails,
    ],
    [
      'Must not require additional details',
      mustNotRequireAdditionalDetails,
    ],
  ],
  testDataShape: () => ({
    offerConstraints: ({
      // mustNotRequireAttendeeDetails, mustNotRequireAdditionalDetails
      'oa:openBookingFlowRequirement': openBookingFlowRequirementArrayConstraint({
        excludesAll: [
          'https://openactive.io/OpenBookingAttendeeDetails',
          'https://openactive.io/OpenBookingIntakeForm',
        ],
      }),
    }),
  }),
  includeConstraintsFromCriteria: InternalCriteriaFutureScheduledOpportunity,
});

module.exports = {
  InternalCriteriaFutureScheduledAndDoesNotRequireDetails,
};
