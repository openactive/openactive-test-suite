const chai = require('chai');

chai.should();
chai.use(require('chai-things'));

const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
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
  const [simulateSellerCancellation, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Seller Cancellation (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:SellerRequestedCancellationWithMessageSimulateAction',
        objectType: 'Order',
        objectId: bookRecipe.b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: bookRecipe.lastStage,
      testName: 'Orders Feed (after Simulate Seller Cancellation)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerCancellation);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderItemStatus: SellerCancelled', () => {
      const orderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      chai.expect(orderItems).to.be.an('array').with.lengthOf(orderItemCriteriaList.length);
      orderItems
        .should.include.something.that.has.property('orderItemStatus', 'https://openactive.io/SellerCancelled')
        .and
        .should.include.something.that.has.property('cancellationMessage').which.is.a('string');
    });
  });
});
