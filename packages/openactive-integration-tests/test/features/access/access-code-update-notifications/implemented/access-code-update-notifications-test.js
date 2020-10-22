/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const RequestHelper = require('../../../../helpers/request-helper');
const sharedValidationTests = require('../../../../shared-behaviours/validation');
const { GetMatch, C1, C2, OrderFeedUpdate, TestInterfaceAction, B, Common } = require('../../../../shared-behaviours');
const { expect } = chakram;

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

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

  describe('Simulate Access Code Update (Test Interface Action)', () => {
    const response = (new TestInterfaceAction({
      flow,
      logger,
      createActionFn: () => ({
        type: 'test:AccessCodeUpdateSimulateAction',
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
  //Test that accesscode is updated!
  // it('Response should include accessCode array with appropriate fields (name and description) for each OrderItem', () => {
  //   chai.expect(state.bResponse.body.orderedItem).to.be.an('array');

  //   state.bResponse.body.orderedItem.forEach((orderItem, orderItemIndex) => {
  //     chai.expect(orderItem.accessCode).to.be.an('array');

  //     orderItem.accessCode.forEach((accessCode, accessCodeIndex) => {
  //       chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessCode[${accessCodeIndex}].name`).that.is.a('string');
  //       chai.expect(state.bResponse.body).to.have.nested.property(`orderedItem[${orderItemIndex}].accessCode[${accessCodeIndex}].description`).to.equal('updatedPinCode');
  //     });
  //   });
  // });
   // });
});
