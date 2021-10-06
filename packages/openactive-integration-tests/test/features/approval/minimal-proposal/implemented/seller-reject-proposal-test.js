const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageRecipes,
  FlowStageUtils,
  PFlowStage,
  // BFlowStage,
  TestInterfaceActionFlowStage,
  OrderFeedUpdateFlowStageUtils,
} = require('../../../../helpers/flow-stages');
// const { AssertOpportunityCapacityFlowStage } = require('../../../../helpers/flow-stages/assert-opportunity-capacity');
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
  testFeature: 'minimal-proposal',
  testFeatureImplemented: true,
  testIdentifier: 'seller-reject-proposal',
  testName: 'OrderProposal rejected by the Seller',
  testDescription: 'An OrderProposal that is rejected by the Seller, and the call to B subsequently fails',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipBookingFlows: ['OpenBookingSimpleFlow'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger);
  const p = new PFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2.getLastStage(),
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getStage('c2').getOutput().totalPaymentDue,
      prepayment: c2.getStage('c2').getOutput().prepayment,
    }),
  });
  const [simulateSellerRejection, orderFeedUpdate] = OrderFeedUpdateFlowStageUtils.wrap({
    wrappedStageFn: prerequisite => (new TestInterfaceActionFlowStage({
      ...defaultFlowStageParams,
      testName: 'Test Interface Action (test:SellerRejectOrderProposalSimulateAction)',
      prerequisite,
      createActionFn: () => ({
        type: 'test:SellerRejectOrderProposalSimulateAction',
        objectType: 'OrderProposal',
        objectId: p.getOutput().orderId,
      }),
    })),
    orderFeedUpdateParams: {
      ...defaultFlowStageParams,
      prerequisite: p,
      testName: 'Orders Feed (after test:SellerRejectOrderProposalSimulateAction)',
      orderFeedType: 'order-proposals',
    },
  });
  const b = FlowStageRecipes.runs.book.simpleBAssertCapacity(orderFeedUpdate, defaultFlowStageParams, {
    isExpectedToSucceed: false,
    fetchOpportunities,
    previousAssertOpportunityCapacity: c2.getStage('assertOpportunityCapacityAfterC2'),
    bArgs: {
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: orderFeedUpdate.getOutput().totalPaymentDue,
        prepayment: orderFeedUpdate.getOutput().prepayment,
        orderProposalVersion: orderFeedUpdate.getOutput().orderProposalVersion,
        positionOrderIntakeFormMap: c1.getStage('c1').getOutput().positionOrderIntakeFormMap,
      }),
    },
  });
  // const b = new BFlowStage({
  //   ...defaultFlowStageParams,
  //   prerequisite: orderFeedUpdate,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     totalPaymentDue: orderFeedUpdate.getOutput().totalPaymentDue,
  //     prepayment: orderFeedUpdate.getOutput().prepayment,
  //     orderProposalVersion: orderFeedUpdate.getOutput().orderProposalVersion,
  //     positionOrderIntakeFormMap: c1.getStage('c1').getOutput().positionOrderIntakeFormMap,
  //   }),
  // });
  // // Capacity should not be decreased by B (as it failed)
  // const assertOpportunityCapacityAfterB = new AssertOpportunityCapacityFlowStage({
  //   ...defaultFlowStageParams,
  //   nameOfPreviousStage: 'B',
  //   prerequisite: b,
  //   getInput: () => ({
  //     orderItems: fetchOpportunities.getOutput().orderItems,
  //     opportunityFeedExtractResponses: c2.getStage('assertOpportunityCapacityAfterC2').getOutput().opportunityFeedExtractResponses,
  //   }),
  //   getOpportunityExpectedCapacity: AssertOpportunityCapacityFlowStage.getOpportunityExpectedCapacityAfterBook(false),
  // });

  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c1.getStage('c1').getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2, () => {
    itShouldReturnOrderRequiresApprovalTrue(() => c2.getStage('c2').getOutput().httpResponse);
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(p, () => {
    // TODO does validator check that orderProposalVersion is of form {orderId}/versions/{versionUuid}
    it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
      expect(p.getOutput().httpResponse.body).to.have.property('orderProposalVersion')
        .which.matches(RegExp(`${defaultFlowStageParams.uuid}/versions/.+`));
    });
    // TODO does validator check that full Seller details are included in the seller response?
  });
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(simulateSellerRejection);
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(orderFeedUpdate, () => {
    it('should have orderProposalStatus: SellerRejected', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property(
        // note that we check data.* because the OrderFeed response is an RPDE item
        'data.orderProposalStatus', 'https://openactive.io/SellerRejected',
      );
    });
    it('should have orderProposalVersion same as that returned by P (i.e. an amendment hasn\'t occurred)', () => {
      expect(orderFeedUpdate.getOutput().httpResponse.body).to.have.nested.property(
        // note that we check data.* because the OrderFeed response is an RPDE item
        'data.orderProposalVersion', p.getOutput().orderProposalVersion,
      );
    });
  });
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('OrderCreationFailedError', 500, () => b.getStage('b').getOutput().httpResponse);
  });
});
