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
  testIdentifier: 'lease-opportunity-unit-capacity-update',
  testName: 'Single anonymous leased spaces are unavailable for purchase by other users',
  testDescription: 'For an opportunity with 1 spaces: Check the opportunity has 1 spaces in the feed. Run C1 to book one item (creating an anonymous lease). Check the opportunity has 0 space in the feed. Run C1 again for a new Order UUID for the same opportunity attempting to book 1 space, expecting OrderItems to be returned having an OpportunityCapacityIsReservedByLeaseError.',
  testOpportunityCriteria: 'TestOpportunityBookableOneSpace',
  // no control, because we don't know what capacity the control will have
  multipleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [{
    opportunityType,
    opportunityCriteria: 'TestOpportunityBookableOneSpace',
    primary: true,
    control: false,
    bookingFlow,
  }],
}, runAnonymousLeasingCapacityTests(true));
