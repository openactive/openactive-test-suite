const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { OrderFeedUpdateFlowStageUtils, TestInterfaceActionFlowStage } = require('../../../../helpers/flow-stages');
const { FlowStageRecipes } = require('../../../../helpers/flow-stages/flow-stage-recipes');
const { FlowStageUtils } = require('../../../../helpers/flow-stages/flow-stage-utils');

FeatureHelper.describeFeature(module, {
  testCategory: 'access',
  testFeature: 'access-channel-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-channel-update-notifications',
  testName: 'Access channel updated after B request.',
  testDescription: 'Access channel, when updated after B request, is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityOnlineBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipOpportunityTypes: ['FacilityUseSlot', 'IndividualFacilityUseSlot'],
  supportsApproval: true,
}, (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  const [simulateAccessChannelUpdate, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Test Interface Action (test:AccessChannelUpdateSimulateAction)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:AccessChannelUpdateSimulateAction',
        // Note that these 2 fields may need to be configurable in future:
        objectType: 'Order',
        objectId: bookRecipe.b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: bookRecipe.b,
      testName: 'Orders Feed (after test:AccessChannelUpdateSimulateAction)',
    },
  });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateAccessChannelUpdate);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have a new access channel value', () => {
      // original = before the AccessChannelUpdateSimulationAction was invoked
      const originalOnlineOrderItem = bookRecipe.b.getOutput().httpResponse.body.orderedItem[0];
      const orderItemId = originalOnlineOrderItem.id;
      // new = after the AccessChannelUpdateSimulationAction was invoked
      const newOnlineOrderItem = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem.find(orderItem => (
        orderItem.id === orderItemId));
      expect(newOnlineOrderItem.accessChannel).to.not.deep.equal(originalOnlineOrderItem.accessChannel);
    });
  });
});
