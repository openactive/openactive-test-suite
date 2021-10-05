const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'seller-requested-cancellation-message',
  testFeatureImplemented: true,
  testIdentifier: 'seller-requested-cancellation-with-message',
  testName: 'Seller cancellation with message of order request.',
  testDescription: 'A successful cancellation of order by seller, Order in feed should have status SellerCancelled and cancellation message',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);
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
  // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderFeedUpdateAfterCancel = simulateSellerCancellation.getStage('orderFeedUpdate');
      const orderItems = orderFeedUpdateAfterCancel.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      const aCancelledOrderItem = orderItems.find(orderItem => orderItem.orderItemStatus === 'https://openactive.io/SellerCancelled');
      expect(aCancelledOrderItem).to.have.property('cancellationMessage').which.is.a('string');
    });
  });
});
