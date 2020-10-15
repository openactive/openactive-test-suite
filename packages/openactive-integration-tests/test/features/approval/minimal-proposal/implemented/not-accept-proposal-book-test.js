const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, P, B } = require('../../../../shared-behaviours');
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
  testOpportunityCriteria: 'TestOpportunityBookableFlowRequirementOnlyApproval',
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

  describe('B', () => {
    (new B({
      state,
      flow,
      logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldReturnAnOpenBookingError('OrderCreationFailedError', 500, () => state.bResponse);
  });
});
