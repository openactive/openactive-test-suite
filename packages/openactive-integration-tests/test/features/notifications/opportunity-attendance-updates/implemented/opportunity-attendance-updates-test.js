const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageUtils,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  BFlowStage,
} = require('../../../../helpers/flow-stages');

FeatureHelper.describeFeature(module, {
  testCategory: 'notifications',
  testFeature: 'opportunity-attendance-updates',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-attendance-updates',
  testName: "Changes to an opportunity's attendance (via OpportunityAttendanceUpdateSimulateAction) should update the Order Feed.",
  testDescription: "After B, invoke an OpportunityAttendanceUpdateSimulateAction. This should create an update in the Order Feed with the OrderItem's orderItemStatus changed to CustomerAttended",
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const requestHelper = new RequestHelper(logger);

  // ## Initiate Flow Stages
  const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
  const fetchOpportunities = new FetchOpportunitiesFlowStage({
    ...defaultFlowStageParams,
    orderItemCriteriaList,
  });
  const c1 = new C1FlowStage({
    ...defaultFlowStageParams,
    prerequisite: fetchOpportunities,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const c2 = new C2FlowStage({
    ...defaultFlowStageParams,
    prerequisite: c1,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
    }),
  });
  const b = new BFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
      prepayment: c2.getOutput().prepayment,
    }),
  });
  const [simulateAttendanceUpdate, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Attendance Update (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:OpportunityAttendanceUpdateSimulateAction',
        objectType: 'Order',
        objectId: b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after Simulate Attendance Update)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateAttendanceUpdate);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('OrderItems should have CustomerAttended statuses', () => {
      // new = after the OpportunityAttendanceUpdateSimulateAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array');
      expect(newOrderItems).to.have.lengthOf.above(0);
      expect(newOrderItems).to.have.lengthOf(orderItemCriteriaList.length);

      for (const newOrderItem of newOrderItems) {
        const { orderItemStatus } = newOrderItem;

        expect(orderItemStatus).to.be.a('string');
        expect(orderItemStatus).to.be.equal('https://openactive.io/CustomerAttended');
      }
    });
  });
});
