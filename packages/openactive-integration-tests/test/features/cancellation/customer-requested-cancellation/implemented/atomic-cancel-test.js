const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, OrderFeedUpdateFlowStageUtils, OrderDeletionFlowStage, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'atomic-cancel',
  testName: 'Successful booking and successful cancellation after atomic failed cancellation request',
  testDescription: 'After a successful booking, and an unsuccessful but atomic cancellation request, successfully cancel, including checking the Orders feed.',
  // Single Opportunity Criteria is overridden here as this test must have three Order Items
  singleOpportunityCriteriaTemplate: opportunityType => [
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableCancellable',
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableCancellable',
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableCancellableOutsideWindow',
    },
  ],
  skipMultiple: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, b, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteria, logger);
  
  // ### Cancel 2nd and 3rd Order Items, one of which is not cancellable
  const [cancelNotCancellableOrderItems] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: CancelOrderFlowStage.getSpecificedOrderItemIdsFromB(b, [1,2]),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });

  // ### Cancel 1st Order Item which is cancellable
  const [cancelCancellableOrderItem, orderFeedUpdateAfter2ndCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: CancelOrderFlowStage.getFirstOrderItemIdFromB(b),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: cancelNotCancellableOrderItems,
      testName: 'Orders Feed (after OrderCancellation)',
    },
  });


  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsValid(cancelNotCancellableOrderItems, () => {
    itShouldReturnAnOpenBookingError('CancellationNotPermittedError', 400, () => cancelNotCancellableOrderItems.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelCancellableOrderItem);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfter2ndCancel, () => {
    it('should have orderItemStatus: CustomerCancelled', () => {
      const orderItems = orderFeedUpdateAfter2ndCancel.getOutput().httpResponse.body.data.orderedItem;
      expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteria.length);
      expect(orderItems[0]).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
      for (const orderItem of orderItems.slice(1)) {
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/OrderItemConfirmed');
      }
    });
  });
});
