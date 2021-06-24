const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { runAnonymousLeasingCapacityTests } = require('../common');

/**
 * @typedef {import('../../../../helpers/flow-stages/flow-stage').UnknownFlowStageType} UnknownFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/c1').C1FlowStageType} C1FlowStageType
 * @typedef {import('../../../../helpers/flow-stages/fetch-opportunities').FetchOpportunitiesFlowStageType} FetchOpportunitiesFlowStageType
 * @typedef {import('../../../../helpers/flow-stages/flow-stage').OrderItem} OrderItem
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'leasing',
  testFeature: 'anonymous-leasing',
  testFeatureImplemented: true,
  testIdentifier: 'lease-opportunity-multiple-capacity-update',
  testName: 'Multiple anonymous leased spaces are unavailable for purchase by other users',
  testDescription: 'For an opportunity with 2 spaces: Check the opportunity has 2 spaces in the feed. Run C1 to book one item (creating an anonymous lease). Check the opportunity has 1 space in the feed. Run C1 again for a new Order UUID for the same opportunity attempting to book 3 spaces, expecting OrderItems to be returned with 1 having no errors, 1 having an OpportunityCapacityIsReservedByLeaseError, and 1 having an OpportunityHasInsufficientCapacityError.',
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
}, runAnonymousLeasingCapacityTests(false));
