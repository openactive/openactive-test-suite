const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
const { getOrderItemAtPositionXFromOrdersApiResponse } = require('../../../../shared-behaviours/common');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-channel',
  testFeatureImplemented: true,
  testIdentifier: 'includes-access-channel-or-customer-notice',
  testName: 'Details about virtual location included in B response.',
  testDescription: 'Online opportunities include, in the B response, either:'
    + ' (1). The virtual location or'
    + ' (2). a `customerNotice` informing that the virtual location will be shared before the booked opportunity'
    + ' starts.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOnlineBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipOpportunityTypes: ['FacilityUseSlot', 'IndividualFacilityUseSlot'],
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    it('should include an `accessChannel` or a `customerNotice`', () => {
      /* The item with position 0 will be the one that satisfies the primary test opportunity criteria (and
      therefore is online). */
      const orderItemWithPrivateVirtualLocation = getOrderItemAtPositionXFromOrdersApiResponse(
        0,
        bookRecipe.b.getOutput().httpResponse,
        bookRecipe.firstStage.getOutput().httpResponse,
      );
      expect(orderItemWithPrivateVirtualLocation).to.satisfy(orderItem => (
        (orderItem.accessChannel && orderItem.accessChannel['@type'] === 'VirtualLocation')
        || (typeof orderItem.customerNotice === 'string' && orderItem.customerNotice.length > 0)
      ), 'have accessChannel, which is a VirtualLocation, or customerNotice, as non-empty string');
    });
  });
});
