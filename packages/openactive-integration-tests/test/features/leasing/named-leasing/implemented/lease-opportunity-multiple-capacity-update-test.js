const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runNamedLeasingCapacityTests } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'named-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-opportunity-multiple-capacity-update',
  testName: 'Multiple named leased spaces are unavailable for purchase by other users',
  testDescription: "For an opportunity with 2 spaces: Check the opportunity has 2 spaces in the feed. Run C1 and C2 to book one item (creating an named lease) - during this run call C2 twice, and check that both times there are still 2 remaining spaces from this UUID's perspective. Check the opportunity has 1 space in the feed. Run C1 and C2 again for a new Order UUID for the same opportunity attempting to book 3 spaces, expecting OrderItems to be returned with 1 having no errors, 1 having an OpportunityCapacityIsReservedByLeaseError, and 1 having an OpportunityHasInsufficientCapacityError.",
  testOpportunityCriteria: 'TestOpportunityBookableFiveSpaces',
  // no control, because we don't know what capacity the control will have
  skipOpportunityTypes: ['IndividualFacilityUseSlot'],
  multipleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [{
    opportunityType,
    opportunityCriteria: 'TestOpportunityBookableFiveSpaces',
    primary: true,
    control: false,
    bookingFlow,
  }],
}, runNamedLeasingCapacityTests(false));
