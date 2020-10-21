/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const chai = require('chai'); // The latest version for new features than chakram includes
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, OrderFeedUpdate, TestInterfaceAction, B, Common } = require('../../../../shared-behaviours');
// const { GetMatch, C1, C2, P } = require('../../../../shared-behaviours');
const { expect } = chakram;

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
  testCategory: 'cancellation',
  testFeature: 'seller-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'seller-requested-cancellation',
  testName: 'Seller cancellation of order request.',
  testDescription: 'A successful cancellation of order by seller, Order in feed should have status SellerCancelled',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // even if some OrderItems don't require approval, the whole Order should
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
  this.requestHelper = new RequestHelper(logger);
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
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('B', () => {
    const resp = (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Simulate Seller Cancellation (Test Interface Action)', () => {
    const response = (new TestInterfaceAction({
      flow,
      logger,
      createActionFn: () => ({
        type: 'test:SellerRequestedCancellationSimulateAction',
        objectType: 'Order',
        objectId: state.bResponse.body['@id'],
      }),
      completedFlowStage: 'B',
    }))
      .beforeSetup()
      .successChecks();
  });

  // TODO: Orders feed check
  // describe('Orders Feed (after U)', () => {
  //     const orderFeedUpdate = (new OrderFeedUpdate({
  //       state,
  //       flow,
  //       logger,
  //       ordersFeedMode: 'orders-feed-after-u',
  //     }))
  //       .beforeSetup()
  //       .successChecks()
  //       .validationTests();

//     it('should have orderStatus: SellerCancelled', () => {
//       expect(orderFeedUpdate.getStateResponse().body).to.have.nested.property('data.orderStatus', 'https://openactive.io/SellerCancelled');
//     });
//   });
});
