const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const {
  FlowStageUtils,
  FlowStageRecipes,
} = require('../../../../helpers/flow-stages');

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
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
  skipBookingFlows: ['OpenBookingSimpleFlow'],
},
(configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
  const { fetchOpportunities, c1, c2, defaultFlowStageParams } = FlowStageRecipes.initialiseSimpleC1C2Flow(
    orderItemCriteriaList,
    logger,
  );
  const bookRecipe = FlowStageRecipes.bookApproval(orderItemCriteriaList, defaultFlowStageParams, {
    prerequisite: c2,
    getFirstStageInput: () => ({
      orderItems: fetchOpportunities.getOutput().orderItems,
      totalPaymentDue: c2.getOutput().totalPaymentDue,
      prepayment: c2.getOutput().prepayment,
      positionOrderIntakeFormMap: c1.getOutput().positionOrderIntakeFormMap,
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
  FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe, () => {
    // TODO does validator already check that orderProposalVersion is of form {orderId}/versions/{versionUuid}?
    it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
      const { uuid } = defaultFlowStageParams;
      expect(bookRecipe.p.getOutput().httpResponse.body).to.have.property('orderProposalVersion')
        .which.matches(RegExp(`${uuid}/versions/.+`));
    });
    // TODO does validator check that full Seller details are included in the seller response?
    it('should have orderProposalStatus: SellerAccepted', () => {
      expect(bookRecipe.orderFeedUpdateCollector.getOutput().httpResponse.body)
        .to.have.nested.property('data.orderProposalStatus', 'https://openactive.io/SellerAccepted');
    });
    it('should have orderProposalVersion same as that returned by P (i.e. an amendment hasn\'t occurred)', () => {
      expect(bookRecipe.orderFeedUpdateCollector.getOutput().httpResponse.body)
        .to.have.nested.property('data.orderProposalVersion', bookRecipe.p.getOutput().orderProposalVersion);
    });
    it('should have deleted the OrderProposal after B', () => {
      expect(bookRecipe.orderFeedUpdateAfterDeleteProposal.getOutput().httpResponse.body).to.have.property('state', 'deleted');
    });
  });
});
