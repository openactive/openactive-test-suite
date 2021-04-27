const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, OrderFeedUpdateFlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-cancel',
  testName: 'Successful booking and cancellation.',
  testDescription: 'A successful end to end booking including full Order cancellation, including checking the Orders Feed. Two cancellation requests are made to ensure that cancellation is atomic.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookableCancellable',
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/120
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteria, logger);

  // Get all OrderItem IDs
  const getArrayOfAllOrderItemIds = CancelOrderFlowStage.getOrderItemIdsByPositionFromBookStages(bookRecipe.b, [...Array(orderItemCriteria.length).keys()]);

  // ### Cancel all order items
  const [cancelOrderItem, orderFeedUpdateAfter1stCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: getArrayOfAllOrderItemIds,
      testName: 'Cancel Order',
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: bookRecipe.b,
      testName: 'Orders Feed (after Order Cancellation)',
    },
  });

  // ### Cancel order items again to test for idempotency
  const cancelOrderItemAgain = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    prerequisite: cancelOrderItem,
    getOrderItemIdArray: getArrayOfAllOrderItemIds,
    testName: 'Cancel Order again (to test for idempotency)',
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItem);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfter1stCancel, () => {
    const orderItemsAccessor = () => orderFeedUpdateAfter1stCancel.getOutput().httpResponse.body.data.orderedItem;
    it('should include all OrderItems', () => {
      expect(orderItemsAccessor()).to.be.an('array').with.lengthOf(orderItemCriteria.length);
    });
    it('should have orderItemStatus CustomerCancelled for each cancelled item', () => {
      const cancelledOrderItemIds = getArrayOfAllOrderItemIds();
      for (const orderItem of orderItemsAccessor()) {
        expect(orderItem['@id']).to.be.oneOf(cancelledOrderItemIds);
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItemAgain);
});
