const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const {
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'customer-notice-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'customer-notice-notification',
  testName: "Changes to an OrderItem's customerNotice (via CustomerNoticeSimulateAction) should update the Order Feed.",
  testDescription: "After B, invoke a CustomerNoticeSimulateAction. This should create an update in the Order Feed with the OrderItem's customerNotice changed.",
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const requestHelper = new RequestHelper(logger);

  // ## Initiate Flow Stages
  const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
  const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger);
  const [simulateCustomerNoticeUpdate, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Customer Notice Update (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:CustomerNoticeSimulateAction',
        objectType: 'Order',
        objectId: b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after Simulate Customer Notice Update)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateCustomerNoticeUpdate);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have customer notices with non empty string values', () => {
      // new = after the CustomerNoticeSimulateAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array')
        .and.to.have.lengthOf.above(0)
        .and.to.have.lengthOf(orderItemCriteriaList.length);

      for (const newOrderItem of newOrderItems) {
        const newCustomerNotice = newOrderItem.customerNotice;

        // Checking that customerNotice now has a non-empty value
        expect(newCustomerNotice).to.be.a('string')
          .and.to.have.lengthOf.at.least(1);
      }
    });
  });
});
