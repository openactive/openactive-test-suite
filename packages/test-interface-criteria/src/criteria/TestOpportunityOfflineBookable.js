const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');

/**
 * Check if event is offline without checking its `superEvent`
 */
function isEventIndependentlyOffline(event) {
  return event.eventAttendanceMode === 'https://schema.org/MixedEventAttendanceMode'
    || event.eventAttendanceMode === 'https://schema.org/OfflineEventAttendanceMode';
}

function isOpportunityEventAttendanceModeEqualToMixedOrOffline(opportunity) {
  if (opportunity.eventAttendanceMode) {
    return isEventIndependentlyOffline(opportunity);
  }
  if (opportunity.superEvent) {
    return isEventIndependentlyOffline(opportunity.superEvent);
  }
  // Note that we don't consider `.facilityUse` as a FacilityUse cannot have `eventAttendanceMode`
  return false;
}

const TestOpportunityOfflineBookable = createCriteria({
  name: 'TestOpportunityOfflineBookable',
  opportunityConstraints: [
    [
      'eventAttendanceMode must be equal to MixedEventAttendanceMode or OfflineEventAttendanceMode',
      isOpportunityEventAttendanceModeEqualToMixedOrOffline,
    ],
  ],
  offerConstraints: [],
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityOfflineBookable,
};
