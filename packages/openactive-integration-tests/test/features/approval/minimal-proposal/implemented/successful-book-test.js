const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, P, OrderFeedUpdate, TestInterfaceAction, B } = require('../../../../shared-behaviours');
// const { GetMatch, C1, C2, P } = require('../../../../shared-behaviours');

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
  testIdentifier: 'successful-book',
  testName: 'Successful booking using the Booking Flow with Approval',
  testDescription: 'A successful end to end booking, via Booking Flow with Approval, of an opportunity.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityMinimalProposalBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  beforeAll(async () => {
    await state.fetchOpportunities(orderItemCriteria);
  });

  describe('Get Opportunity Feed Items', () => {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', () => {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    itShouldReturnOrderRequiresApprovalTrue(() => state.c1Response);
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    itShouldReturnOrderRequiresApprovalTrue(() => state.c2Response);
  });

  describe('P', () => {
    (new P({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    // TODO does validator check that orderProposalVersion is of form {orderId}/versions/{versionUuid}
    it('should include an orderProposalVersion, of the form {orderId}/versions/{versionUuid}', () => {
      expect(state.pResponse.body).to.have.property('orderProposalVersion')
        .which.matches(RegExp(`${state.uuid}/versions/.+`));
    });
    // TODO does validator check that orderItemStatus is https://openactive.io/OrderItemProposed
    // TODO does validator check that full Seller details are included in the seller response?
  });

  describe('Simulate Seller Approval (Test Interface Action)', () => {
    (new TestInterfaceAction({
      flow,
      logger,
      createActionFn: () => ({
        type: 'test:SellerAcceptOrderProposalSimulateAction',
        objectType: 'OrderProposal',
        objectId: state.pResponse.body['@id'],
      }),
      completedFlowStage: 'P',
    }))
      .beforeSetup()
      .successChecks();
  });

  describe('Orders Feed (after P)', () => {
    const orderFeedUpdate = (new OrderFeedUpdate({
      state,
      flow,
      logger,
      ordersFeedMode: 'orders-feed-after-p',
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    it('should have orderProposalStatus: SellerAccepted', () => {
      expect(orderFeedUpdate.getStateResponse().body).to.have.property('orderProposalStatus', 'https://openactive.io/SellerAccepted');
    });
    it('should have orderProposalVersion same as that returned by P (i.e. an amendment hasn\'t occurred)', () => {
      expect(orderFeedUpdate.getStateResponse().body).to.have.property('orderProposalVersion', state.pResponse.body.orderProposalVersion);
    });
  });

  describe('B', () => {
    (new B({
      state,
      flow,
      logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });
});
