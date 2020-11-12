const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { OrderDeletionFlowStage } = require('../../../../helpers/flow-stages/order-deletion');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'orders-updated-then-deleted',
  testName: 'Order successfully deleted',
  testDescription: 'Run C1, C2 and B, and then check Orders feed for Order, then cancel it, then run Order Deletion, and check Orders feed that Order has been deleted',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  const [simulateSellerCancellation, orderFeedUpdateAfterCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Seller Cancellation (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:SellerRequestedCancellationWithMessageSimulateAction',
        objectType: 'Order',
        objectId: b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after Simulate Seller Cancellation)',
    },
  });

  const [deleteOrder, orderFeedUpdateAfterDelete] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new OrderDeletionFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: orderFeedUpdateAfterCancel,
      testName: 'Orders Feed (after OrderDeletion)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfterCancel, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderItems = orderFeedUpdateAfterCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      for (const orderItem of orderItems) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/SellerCancelled');
        expect(orderItem).to.have.property('cancellationMessage').which.is.a('string');
      }
    });
  });
  describe.skip('un-skip this once https://github.com/openactive/OpenActive.Server.NET/issues/87 is completed', () => {
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteOrder);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfterDelete, () => {
      it('should have state: deleted', () => {
        expect(orderFeedUpdateAfterDelete.getOutput().httpResponse.body.state).to.equal('deleted');
      });
    });
  });
});
