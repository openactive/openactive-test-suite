const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  OrderFeedUpdateFlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { OrderDeletionFlowStage } = require('../../../../helpers/flow-stages/order-deletion');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'orders-updated-then-deleted',
  testName: 'Order successfully deleted',
  testDescription: 'Run C1, C2 and B, and then check Orders feed for Order, then cancel it, then run Order Deletion, and check Orders feed that Order has been deleted. NOTE: This test will only run if seller-requested-cancellation is enabled as this feature is utilised in the test',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  runOnlyIf: IMPLEMENTED_FEATURES['seller-requested-cancellation'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  const simulateSellerCancellation = FlowStageRecipes.runs.sellerCancel.successfulCancelAssertOrderUpdateAndCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    fetchOpportunities,
    getOrderId: () => bookRecipe.b.getOutput().orderId,
  });

  const [deleteOrder, orderFeedUpdateAfterDelete] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new OrderDeletionFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: simulateSellerCancellation.getLastStage(),
      testName: 'Orders Feed (after OrderDeletion)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation, () => {
    const orderFeedUpdateAfterCancel = simulateSellerCancellation.getStage('orderFeedUpdate');
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderItems = orderFeedUpdateAfterCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      for (const orderItem of orderItems) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/SellerCancelled');
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteOrder);
  FlowStageUtils.describeRunAndRunChecks({ doCheckSuccess: true, doCheckIsValid: false }, orderFeedUpdateAfterDelete, () => {
    it('should have state: deleted', () => {
      expect(orderFeedUpdateAfterDelete.getOutput().httpResponse.body.state).to.equal('deleted');
    });
  });
});
