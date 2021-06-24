const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runNamedLeasingCapacityTests } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'named-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-opportunity-unit-capacity-update',
  testName: 'Single named leased space is unavailable for purchase by other users',
  testDescription: "For an opportunity with 1 spaces: Check the opportunity has 1 space in the feed. Run C1 and C2 to book one item (creating an named lease) - during this run call C2 twice, and check that both times there are still 1 remaining space from this UUID's perspective. Check the opportunity has 0 space in the feed. Run C1 and C2 again for a new Order UUID for the same opportunity attempting to book 1 space, expecting OrderItems to be returned having an OpportunityCapacityIsReservedByLeaseError.",
  testOpportunityCriteria: 'TestOpportunityBookableOneSpace',
  // no control, because we don't know what capacity the control will have
  multipleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [{
    opportunityType,
    opportunityCriteria: 'TestOpportunityBookableOneSpace',
    primary: true,
    control: false,
    bookingFlow,
  }],
}, runNamedLeasingCapacityTests(true));
