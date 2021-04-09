const { createCriteria } = require('./criteriaUtils');
const { TestOpportunityBookable } = require('./TestOpportunityBookable');

/**
 * Check if event supports online without checking its `superEvent`
 */
function doesEventIndependentlySupportOnline(event) {
  return event.eventAttendanceMode === 'https://schema.org/MixedEventAttendanceMode'
    || event.eventAttendanceMode === 'https://schema.org/OnlineEventAttendanceMode';
}

function isOpportunityEventAttendanceModeEqualToMixedOrOnline(opportunity) {
  if (opportunity.eventAttendanceMode) {
    return doesEventIndependentlySupportOnline(opportunity);
  }
  if (opportunity.superEvent) {
    return doesEventIndependentlySupportOnline(opportunity.superEvent);
  }
  // Note that we don't consider `.facilityUse` as a FacilityUse cannot have `eventAttendanceMode`
  return false;
}

const TestOpportunityOnlineBookable = createCriteria({
  name: 'TestOpportunityOnlineBookable',
  opportunityConstraints: [
    [
      'eventAttendanceMode must be equal to MixedEventAttendanceMode or OnlineEventAttendanceMode',
      isOpportunityEventAttendanceModeEqualToMixedOrOnline,
    ],
  ],
  offerConstraints: [],
  testDataShape: () => ({}), // TODO: Add data shape
  includeConstraintsFromCriteria: TestOpportunityBookable,
});

module.exports = {
  TestOpportunityOnlineBookable,
};
