const { expect } = require('chai');
const { zip } = require('lodash');
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
  testCategory: 'access',
  testFeature: 'access-code-update-notifications',
  testFeatureImplemented: true,
  testIdentifier: 'access-code-update-notifications-test',
  testName: 'Access code updated after B request.',
  testDescription: 'Access code updated after B request is reflected in Orders feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
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
    }),
  });
  const [simulateAccessCodeUpdate, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Access Code Update (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:AccessCodeUpdateSimulateAction',
        objectType: 'Order',
        objectId: b.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: b,
      testName: 'Orders Feed (after Simulate Access Code Update)',
    },
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateAccessCodeUpdate);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have access codes with altered values', () => {
      // original = before the AccessCodeUpdateSimulationAction was invoked
      const originalOrderItems = b.getOutput().httpResponse.body.orderedItem;
      // new = after the AccessCodeUpdateSimulationAction was invoked
      const newOrderItems = orderFeedUpdate.getOutput().httpResponse.body.data.orderedItem;
      // As we'll be setting out expectations in an iteration, this test would
      // give a false positive if there were no items in `orderedItem`, so we
      // explicitly test that the OrderItems are present.
      expect(newOrderItems).to.be.an('array');
      expect(newOrderItems).to.have.lengthOf.above(0);
      expect(newOrderItems).to.have.lengthOf(orderItemCriteriaList.length);

      for (const [originalOrderItem, newOrderItem] of zip(originalOrderItems, newOrderItems)) {
        const originalAccessCodes = originalOrderItem.accessCode;
        const newAccessCodes = newOrderItem.accessCode;

        // we don't check that newAccessCodes has the same length as originalAccessCodes
        // as the length could feasibly have changed from the AccessCodeUpdateSimulateAction
        // All we need to do, therefore, is check that the codes, as a whole, are different.
        const sortedOriginalAccessCodes = [...originalAccessCodes].sort();
        const sortedNewAccessCodes = [...newAccessCodes].sort();
        expect(sortedNewAccessCodes).to.not.deep.equal(sortedOriginalAccessCodes);
      }
    });
  });
});
