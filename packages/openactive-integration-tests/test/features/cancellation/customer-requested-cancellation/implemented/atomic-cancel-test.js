const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, OrderFeedUpdateFlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'atomic-cancel',
  testName: 'Successful booking and successful cancellation after atomic failed cancellation request',
  testDescription: 'After a successful booking, and an unsuccessful but atomic cancellation request, successfully cancel, including checking the Orders feed.',
  // Single Opportunity Criteria is overridden here as this test must have three Order Items
  singleOpportunityCriteriaTemplate: (opportunityType, bookingFlow) => [
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableCancellable',
      bookingFlow,
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableCancellable',
      bookingFlow,
    },
    {
      opportunityType,
      opportunityCriteria: 'TestOpportunityBookableNotCancellable',
      bookingFlow,
    },
  ],
  skipMultiple: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteria, logger);

  // ### Cancel 2nd and 3rd Order Items, one of which is not cancellable
  const cancelNotCancellableOrderItems = new CancelOrderFlowStage({
    ...defaultFlowStageParams,
    prerequisite: bookRecipe.b,
    getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdsByPositionFromBookStages(bookRecipe.firstStage, [1, 2]),
    testName: 'Cancel Order for non-cancellable items',
  });

  // ### Cancel 1st Order Item which is cancellable
  const [cancelCancellableOrderItem, orderFeedUpdateAfter2ndCancel] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new CancelOrderFlowStage({
      ...defaultFlowStageParams,
      prerequisite,
      getOrderItemIdArray: CancelOrderFlowStage.getOrderItemIdsByPositionFromBookStages(bookRecipe.firstStage, [0]),
      testName: 'Cancel Order for cancellable item',
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: cancelNotCancellableOrderItems,
      testName: 'Orders Feed (after successful OrderCancellation)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsValid(cancelNotCancellableOrderItems, () => {
    itShouldReturnAnOpenBookingError('CancellationNotPermittedError', 400, () => cancelNotCancellableOrderItems.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelCancellableOrderItem);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdateAfter2ndCancel, () => {
    const cancelledOrderItemIdAccessor = () => CancelOrderFlowStage.getOrderItemIdForPosition0FromFirstBookStage(bookRecipe.firstStage)()[0];
    const orderItemsAccessor = () => orderFeedUpdateAfter2ndCancel.getOutput().httpResponse.body.data.orderedItem;
    it('should include all OrderItems', () => {
      expect(orderItemsAccessor()).to.be.an('array').with.lengthOf(orderItemCriteria.length);
    });
    it('should have orderItemStatus CustomerCancelled for cancelled item', () => {
      const cancelledOrderItemId = cancelledOrderItemIdAccessor();
      for (const orderItem of orderItemsAccessor()) {
        if (orderItem['@id'] === cancelledOrderItemId) {
          expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
        }
      }
    });
    it('should have orderItemStatus OrderItemConfirmed for other items', () => {
      const cancelledOrderItemId = cancelledOrderItemIdAccessor();
      for (const orderItem of orderItemsAccessor()) {
        if (orderItem['@id'] !== cancelledOrderItemId) {
          expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/OrderItemConfirmed');
        }
      }
    });
  });
});
