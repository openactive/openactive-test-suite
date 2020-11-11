/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  BFlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
const { OrderDeletionFlowStage } = require('../../../../helpers/flow-stages/order-deletion');
const RequestHelper = require('../../../../helpers/request-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'order-deletion',
  testFeatureImplemented: true,
  testIdentifier: 'orders-updated-then-deleted',
  testName: 'Order successfully deleted',
  testDescription: 'Run C1, C2 and B, and then check Orders feed for Order, then run U, then run Order Deletion, and check Orders feed that Order has been deleted',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, state) => {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);

  const [simulateSellerCancellation, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
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

  // TODO: I tried capturing orderFeedUpdate again, but deleted orders won't show there anyway. So maybe OrderDeletionFlowStage is not needed it can be simplified with last commented check.
  const [deleteStage, orderFeedUpdate2] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new OrderDeletionFlowStage({
      ...defaultFlowStageParams,
      prerequisite: orderFeedUpdate,
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after OrderDeletion)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      for (const orderItem of orderItems) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/SellerCancelled');
        expect(orderItem).to.have.property('cancellationMessage').which.is.a('string');
      }
    });
  });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(deleteStage, () => {
    it('should have deleted order and return 204 NoContent status code', async () => {
      const apiResponse = deleteStage.getOutput().httpResponse;
      expect(apiResponse.response.statusCode).to.equal(204);
    });
  });

  // TODO: COnfirm in Orders feed that it is deleted?

  // describe('Delete Order ', async () => {
  //   it('get order by uuid', async () => {
  //     const apiResponse = await requestHelper.getOrderStatus(defaultFlowStageParams.uuid, { sellerId: defaultFlowStageParams.sellerId });
  //     // give a false positive if there were no items in `orderedItem`, so we
  //     // explicitly test that the OrderItems are present.
  //     expect(apiResponse.response.statusCode).to.equal(204);
  //   });
  //   const apiResponse = await requestHelper.deleteOrderQuote(defaultFlowStageParams.uuid, { sellerId: defaultFlowStageParams.sellerId });
  // });
});
