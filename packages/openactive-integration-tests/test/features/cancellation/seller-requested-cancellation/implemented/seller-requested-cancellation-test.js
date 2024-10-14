const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

// TODO2 then apply to customer cancellation and any other such tests

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'seller-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'seller-requested-cancellation',
  testName: 'Seller cancellation of order request.',
  testDescription: 'A successful cancellation of order by seller, Order in feed should have status SellerCancelled',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
  testInterfaceActions: ['test:SellerRequestedCancellationSimulateAction'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, describeFeatureRecord);

  const simulateSellerCancellation = FlowStageRecipes.runs.sellerCancel.successfulCancelAssertOrderUpdateAndCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    fetchOpportunities,
    getOrderId: () => bookRecipe.b.getOutput().orderId,
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderFeedUpdateAfterCancel = simulateSellerCancellation.getStage('orderFeedUpdate');
      const orderItems = orderFeedUpdateAfterCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      for (const orderItem of orderItems) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/SellerCancelled');
      }
    });
  });
});
