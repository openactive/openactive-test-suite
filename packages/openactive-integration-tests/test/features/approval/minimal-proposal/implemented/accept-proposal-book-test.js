const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FetchOpportunitiesFlowStage,
  C1FlowStage,
  C2FlowStage,
  FlowStageUtils,
  PFlowStage,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  BFlowStage,
} = require('../../../../helpers/flow-stages');
const RequestHelper = require('../../../../helpers/request-helper');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

/**
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnOrderRequiresApprovalTrue(getChakramResponse) {
  it('should return orderRequiresApproval: true', () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.body).to.have.property('orderRequiresApproval', true);
  });
}

FeatureHelper.describeFeature(module, {
  testCategory: 'approval',
  testFeature: 'minimal-proposal',
  testFeatureImplemented: true,
  testIdentifier: 'accept-proposal-book',
  testName: 'Successful booking using the Booking Flow with Approval',
  testDescription: 'A successful end to end booking, via Booking Flow with Approval, of an opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableFlowRequirementOnlyApproval',
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
  const p = new PFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
    }),
  });
  const [simulateSellerApproval, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    // FlowStage that is getting wrapped
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Seller Approval (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:SellerAcceptOrderProposalSimulateAction',
        objectType: 'OrderProposal',
        objectId: p.getOutput().orderId,
      }),
    })),
    // Params for the Order Feed Update stages
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: p,
      testName: 'Order Feed Update (after Simulate Seller Approval)',
    },
  });
  const b = new BFlowStage({
    ...defaultFlowStageParams,
    prerequisite: orderFeedUpdate,
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: p.getOutput().totalPaymentDue,
      orderProposalVersion: p.getOutput().orderProposalVersion,
    }),
  });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c1.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c2.getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p, () => {
    // TODO does validator already check that orderProposalVersion is of form {orderId}/versions/{versionUuid}?
    it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
      const { uuid } = defaultFlowStageParams;
      expect(p.getOutput().httpResponse.body).to.have.property('orderProposalVersion')
        .which.matches(RegExp(`${uuid}/versions/.+`));
    });
    // TODO does validator check that orderItemStatus is https://openactive.io/OrderItemProposed?
    // TODO does validator check that full Seller details are included in the seller response?
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerApproval);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderProposalStatus: SellerAccepted', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property('data.orderProposalStatus', 'https://openactive.io/SellerAccepted');
    });
    it('should have orderProposalVersion same as that returned by P (i.e. an amendment hasn\'t occurred)', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property('data.orderProposalVersion', p.getOutput().orderProposalVersion);
    });
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
});
