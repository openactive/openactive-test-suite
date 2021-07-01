const { eventAttendanceModeOptionNodeConstraint } = require('../testDataShape');
const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');

/**
 * Check if event is offline without checking its `superEvent`
 */
function isEventIndependentlyOffline(event) {
  return !event.eventAttendanceMode || event.eventAttendanceMode === 'https://schema.org/OfflineEventAttendanceMode';
}

function isOpportunityEventAttendanceModeEqualToMixedOrOffline(opportunity) {
  // Note that if it's a FacilityUse it is always Offline
  if (opportunity.facilityUse) {
    return true;
  }
  if (opportunity.eventAttendanceMode) {
    return isEventIndependentlyOffline(opportunity);
  }
  if (opportunity.superEvent) {
    return isEventIndependentlyOffline(opportunity.superEvent);
  }
  if (opportunity.superEvent.superEvent) {
    return isEventIndependentlyOffline(opportunity.superEvent.superEvent);
  }
  return false;
}

const TestOpportunityOfflineBookable = createCriteria({
  name: 'TestOpportunityOfflineBookable',
  opportunityConstraints: [
    [
      'eventAttendanceMode must be equal to OfflineEventAttendanceMode',
      isOpportunityEventAttendanceModeEqualToMixedOrOffline,
    ],
  ],
  offerConstraints: [],
  testDataShape: () => ({
    opportunityConstraints: {
      // isOpportunityEventAttendanceModeEqualToMixedOrOffline
      'schema:eventAttendanceMode': eventAttendanceModeOptionNodeConstraint({
        allowlist: ['https://schema.org/OfflineEventAttendanceMode'],
      }),
    },
  }),
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityOfflineBookable,
};
