const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, CancelOrderFlowStage } = require('../../../../helpers/flow-stages');
const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');

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
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger, opportunityType, bookingFlow) {
  // ## Initiate Flow Stages
  const { fetchOpportunities, c1, c2, bookRecipe, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger);

  // Get all OrderItem IDs
  const allOrderItemPositions = [...Array(orderItemCriteriaList.length).keys()];
  const getArrayOfAllOrderItemIds = CancelOrderFlowStage.getOrderItemIdsByPositionFromBookStages(bookRecipe.firstStage, allOrderItemPositions);

  // ### Cancel all order items
  const cancelOrderItems = FlowStageRecipes.runs.cancellation.successfulCancelAssertOrderUpdateAndCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    cancelArgs: {
      getOrderItemIdArray: getArrayOfAllOrderItemIds,
    },
    assertOpportunityCapacityArgs: {
      orderItemCriteriaList,
      // Opportunity capacity should have incremented for all Order Items
      getInput: () => ({
        opportunityFeedExtractResponses: bookRecipe.getAssertOpportunityCapacityAfterBook().getOutput().opportunityFeedExtractResponses,
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityCapacityIncrementedForOrderItemPositions(allOrderItemPositions),
    },
  });

  // ### Cancel order items again to test for idempotency
  const cancelOrderItemsAgain = FlowStageRecipes.runs.cancellation.successfulCancelAndAssertCapacity(bookRecipe.lastStage, defaultFlowStageParams, {
    cancelArgs: {
      getOrderItemIdArray: getArrayOfAllOrderItemIds,
    },
    assertOpportunityCapacityArgs: {
      orderItemCriteriaList,
      // Opportunity capacity should have not changed since the last cancel
      getInput: () => ({
        opportunityFeedExtractResponses: cancelOrderItems.getStage('assertOpportunityCapacityAfterCancel').getOutput().opportunityFeedExtractResponses,
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
      getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityUnchangedCapacity,
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItems, () => {
    const orderFeedUpdateAfter1stCancel = cancelOrderItems.getStage('orderFeedUpdate');
    const orderItemsAccessor = () => orderFeedUpdateAfter1stCancel.getOutput().httpResponse.body.data.orderedItem;
    it('should include all OrderItems', () => {
      expect(orderItemsAccessor()).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
    });
    it(`should have orderItemStatus CustomerCancelled for each cancelled item, based on the @ids of the OrderItems at ${bookingFlow === 'OpenBookingApprovalFlow' ? 'P' : 'B'}`, () => {
      const cancelledOrderItemIds = getArrayOfAllOrderItemIds();
      for (const orderItem of orderItemsAccessor()) {
        expect(orderItem['@id']).to.be.oneOf(cancelledOrderItemIds);
        expect(orderItem).to.have.property('orderItemStatus', 'https://openactive.io/CustomerCancelled');
      }
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(cancelOrderItemsAgain);
});
