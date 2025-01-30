// const { utils: { getRemainingCapacity } } = require('@openactive/test-interface-criteria');
const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils } = require('../../../../helpers/flow-stages');
// const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');
// const { TestRecipes } = require('../../../../shared-behaviours/test-recipes');

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'seller-requested-replacement',
  testFeatureImplemented: true,
  testIdentifier: 'book-and-seller-replace-items',
  testName: 'Book and seller replaces order items.',
  testDescription: 'A successful replacement of order items by seller.',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  testInterfaceActions: ['test:ReplacementSimulateAction'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger, describeFeatureRecord) => {
  // ## Initiate Flow Stages
  const {
    fetchOpportunities,
    c1,
    c2,
    bookRecipe,
    testInterfaceAction,
    orderFeedUpdate,
    // defaultFlowStageParams,
  } = FlowStageRecipes.successfulC1C2BookFollowedByTestInterfaceAction(orderItemCriteriaList, logger, describeFeatureRecord, {
    actionType: 'test:ReplacementSimulateAction',
  });
  /* TODO in order to do proper capacity assertions for this test:
  - uncomment the below stuff, which will assert capacity for items that were in the original Order (before replacement)
  - add logic which will assert capacity for items that have newly been added to Order
  This will resolve this issue: https://github.com/openactive/openactive-test-suite/issues/671. */
  // const assertOpportunityCapacity = new AssertOpportunityCapacityFlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: orderFeedUpdate,
  //   nameOfPreviousStage: 'test:ReplacementSimulateAction',
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     opportunityFeedExtractResponses: bookRecipe.getAssertOpportunityCapacityAfterBook().getOutput().opportunityFeedExtractResponses,
  //   }),
  //   getOpportunityExpectedCapacity: (opportunity, { count }) => {
  //     // new = after the ReplacementSimulateAction was invoked
  //     const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;

  //     const howManyInstancesOfOpportunityAreStillInNewOrder = newOrderItems.filter(orderItem => orderItem.orderedItem['@id'] === opportunity['@id']).length;
  //     const previousCapacity = getRemainingCapacity(opportunity);
  //     /* So if there were previously 2 OrderItems for this Opportunity and now there is only 1, the expected capacity
  //     should have INCREASED by 1, as a spot in this Opportunity has been released */
  //     return previousCapacity + (count - howManyInstancesOfOpportunityAreStillInNewOrder);
  //   },
  // });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(testInterfaceAction);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have replaced (at least one) OrderItems with a new one', () => {
      // original = before the AccessPassUpdateSimulationAction was invoked
      const originalOrderItems = bookRecipe.b.getOutput().httpResponse.body.orderedItem;

      // new = after the ReplacementSimulateAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;

      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array')
        .and.to.have.lengthOf.above(0)
        .and.to.have.lengthOf(orderItemCriteriaList.length);

      // At least one orderedItem with the OrderItems should be replaced with a new one
      // orderedItems within OrderItems are sorted so that they can be directly compared with one another.
      const originalOpportunityIdsSorted = originalOrderItems.map(orderItem => orderItem.orderedItem['@id']).sort();
      const newOpportunityIdsSorted = newOrderItems.map(orderItem => orderItem.orderedItem['@id']).sort();

      expect(originalOpportunityIdsSorted).to.not.deep.equal(newOpportunityIdsSorted);
    });
  });
  // FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(assertOpportunityCapacity);
});
