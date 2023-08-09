const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowStageRecipes, FlowStageUtils, PFlowStage } = require('../../../../helpers/flow-stages');
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
  testIdentifier: 'not-accept-proposal-book',
  testName: 'OrderProposal not yet accepted by the Seller',
  testDescription: 'An OrderProposal that is not yet accepted by the Seller, and the call to B subsequently fails',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipBookingFlows: ['OpenBookingSimpleFlow'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow(orderItemCriteriaList, logger);
  const paymentIdentifierIfPaid = FlowStageRecipes.createRandomPaymentIdentifierIfPaid();
  const p = new PFlowStage({
    ...defaultFlowStageParams,
    prerequisite: c2.getLastStage(),
    getInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getStage('c2').getOutput().totalPaymentDue,
      prepayment: c2.getStage('c2').getOutput().prepayment,
    }),
    paymentIdentifierIfPaid,
  });
  const b = FlowStageRecipes.runs.book.simpleBAssertCapacity(p, defaultFlowStageParams, {
    isExpectedToSucceed: false,
    fetchOpportunities,
    previousAssertOpportunityCapacity: c2.getStage('assertOpportunityCapacityAfterC2'),
    bArgs: {
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: c2.getStage('c2').getOutput().totalPaymentDue,
        prepayment: c2.getStage('c2').getOutput().prepayment,
        orderProposalVersion: p.getOutput().orderProposalVersion,
        positionOrderIntakeFormMap: c1.getStage('c1').getOutput().positionOrderIntakeFormMap,
      }),
      paymentIdentifierIfPaid,
    },
  });

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
  FlowStageUtils.describeRunAndCheckIsValid(b, () => {
    itShouldReturnAnOpenBookingError('OrderCreationFailedError', 500, () => b.getStage('b').getOutput().httpResponse);
  });
});
