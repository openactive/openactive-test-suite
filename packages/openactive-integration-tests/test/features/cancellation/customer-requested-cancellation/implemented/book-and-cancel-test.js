const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, OrderFeedUpdateFlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-cancel',
  testName: 'Successful booking and cancellation.',
  testDescription: 'A successful end to end booking including cancellation, including checking the Orders Feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger);

  // ### Cancel 1st Order Item
  const [cancelOrderItem, orderFeedUpdateAfter1stCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });

  // ### Cancel 1st Order Item again test idempotency
  const [cancelOrderItemAgain] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: cancelOrderItem,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItem);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfter1stCancel, () => {
    it('should have orderItemStatus: CustomerCancelled', () => {
      const orderItems = orderFeedUpdateAfter1stCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteria.length);
      expect(orderItems[0]).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
      for (const orderItem of orderItems.slice(1)) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/OrderItemConfirmed');
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItemAgain);
});
