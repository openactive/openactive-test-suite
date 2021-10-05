const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  // FetchOpportunitiesFlowStage,
  // C1FlowStage,
  // C2FlowStage,
  FlowStageUtils,
  PFlowStage,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
  // BFlowStage,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');
// const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');
// const RequestHelper = require('../../../../helpers/request-helper');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

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
  testFeature: 'proposal-amendment',
  testFeatureImplemented: true,
  testIdentifier: 'proposal-amendment-book',
  testName: 'Successful booking using the Booking Flow with Approval, creating an amendment',
  testDescription: 'A successful end to end booking, via Booking Flow with Approval, of an opportunity, creating an amendment.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableWithNegotiation',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipBookingFlows: ['OpenBookingSimpleFlow'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  // const requestHelper = new RequestHelper(logger);

  // ## Initiate Flow Stages
  // TODO TODO TODO use flowstageRecipes.c1c2 & then add manual assertion after book
  const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow2(orderItemCriteriaList, logger);
  // const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
  // const fetchOpportunities = new FetchOpportunitiesFlowStage({
  //   ...defaultFlowStageParams,
  //   orderItemCriteriaList,
  // });
  // const c1 = new C1FlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: fetchOpportunities,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //   }),
  // });
  // const c2 = new C2FlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: c1,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //   }),
  // });
  const p = new PFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2.getLastStage(),
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getStage('c2').getOutput().totalPaymentDue,
      prepayment: c2.getStage('c2').getOutput().prepayment,
    }),
  });
  const [simulateSellerAmendment, sellerAmendmentOrderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    // FlowStage that is getting wrapped
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Simulate Seller Proposal Amendment (Test Interface Action)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:SellerAmendOrderProposalSimulateAction',
        objectType: 'OrderProposal',
        objectId: p.getOutput().orderId,
      }),
    })),
    // Params for the Order Feed Update stages
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: p,
      testName: 'Order Feed Update (after Simulate Seller Amendment)',
      orderFeedType: 'order-proposals',
    },
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
      orderFeedType: 'order-proposals',
    },
  });
  // Attempt booking with old proposal version
  const bOldProposalVersion = FlowStageRecipes.runs.book.simpleBAssertCapacity(orderFeedUpdate, defaultFlowStageParams, {
    isExpectedToSucceed: false,
    fetchOpportunities,
    previousAssertOpportunityCapacity: c2.getStage('assertOpportunityCapacityAfterC2'),
    bArgs: {
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: p.getOutput().totalPaymentDue,
        orderProposalVersion: p.getOutput().orderProposalVersion,
        prepayment: p.getOutput().prepayment,
      }),
    },
  });
  // const bOldProposalVersion = new BFlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: orderFeedUpdate,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     totalPaymentDue: p.getOutput().totalPaymentDue,
  //     orderProposalVersion: p.getOutput().orderProposalVersion,
  //     prepayment: p.getOutput().prepayment,
  //   }),
  // });
  // Using the new proposal version should fail
  const bNewProposalVersion = FlowStageRecipes.runs.book.simpleBAssertCapacity(bOldProposalVersion.getLastStage(), defaultFlowStageParams, {
    isExpectedToSucceed: true,
    fetchOpportunities,
    previousAssertOpportunityCapacity: bOldProposalVersion.getStage('assertOpportunityCapacityAfterB'),
    bArgs: {
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: sellerAmendmentOrderFeedUpdate.getOutput().totalPaymentDue,
        orderProposalVersion: sellerAmendmentOrderFeedUpdate.getOutput().orderProposalVersion,
        prepayment: sellerAmendmentOrderFeedUpdate.getOutput().prepayment,
      }),
    },
  });
  // const bNewProposalVersion = new BFlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: orderFeedUpdate,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     totalPaymentDue: sellerAmendmentOrderFeedUpdate.getOutput().totalPaymentDue,
  //     orderProposalVersion: sellerAmendmentOrderFeedUpdate.getOutput().orderProposalVersion,
  //     prepayment: sellerAmendmentOrderFeedUpdate.getOutput().prepayment,
  //   }),
  // });
  // const assertOpportunityCapacityAfterB = new AssertOpportunityCapacityFlowStage({
  //   ...defaultFlowStageParams,
  //   nameOfPreviousStage: 'B',
  //   prerequisite: bNewProposalVersion,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     opportunityFeedExtractResponses: c2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses,
  //   }),
  //   getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBook(true),
  // });

  // ## Set up tests
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c1.getStage('c1').getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c2.getStage('c2').getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p, () => {
    // TODO does validator already check that orderProposalVersion is of form {orderId}/versions/{versionUuid}?
    it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
      const { uuid } = defaultFlowStageParams;
      expect(p.getOutput().httpResponse.body).to.have.property('orderProposalVersion')
        .which.matches(RegExp(`${uuid}/versions/.+`));
    });
    // TODO does validator check that full Seller details are included in the seller response?
  });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerAmendment);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(sellerAmendmentOrderFeedUpdate, () => {
    it('should have orderProposalStatus: AwaitingSellerConfirmation', () => {
      expect(sellerAmendmentOrderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property('data.orderProposalStatus', 'https://openactive.io/AwaitingSellerConfirmation');
    });
    it('should have a different orderProposalVersion to that returned by P (as amendment has occurred)', () => {
      expect(sellerAmendmentOrderFeedUpdate.getOutput().httpResponse.body).to.not.have.nested.property('data.orderProposalVersion', p.getOutput().orderProposalVersion);
    });
  });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerApproval);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderProposalStatus: SellerAccepted', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property('data.orderProposalStatus', 'https://openactive.io/SellerAccepted');
    });
    it('should have orderProposalVersion same as that returned on the feed after Proposal Amendment', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property('data.orderProposalVersion', sellerAmendmentOrderFeedUpdate.getOutput().orderProposalVersion);
    });
  });
  FlowStageUtils.describeRunAndCheckIsValid(bOldProposalVersion, () => {
    itShouldReturnAnOpenBookingError('OrderProposalVersionOutdatedError', 500, () => bOldProposalVersion.getStage('b').getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bNewProposalVersion);
});
