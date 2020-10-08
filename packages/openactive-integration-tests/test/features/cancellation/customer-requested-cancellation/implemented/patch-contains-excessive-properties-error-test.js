/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B, Common } = require('../../../../shared-behaviours');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation',
  testFeatureImplemented: true,
  testIdentifier: 'patch-contains-excessive-properties-error',
  testName: 'Successful booking and unsuccessful cancellation due to PatchContainsExcessiveProperties error',
  testDescription: 'PatchContainsExcessiveProperties returned because patch request includes other properties than @type, @context, orderProposalStatus and orderCustomerNote',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableCancellable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // TODO: Refactor 'Orders Feed' tests so they work with multiple OrderItems
  skipMultiple: true,
},
function (configuration, orderItemCriteria, featureIsImplemented, logger) {
  const state = new RequestState(logger, { uReqTemplateRef: 'excessiveProperties' });
  const flow = new FlowHelper(state);

  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);

    return chakram.wait();
  });

  afterAll(async function () {
    await state.deleteOrder();
    return chakram.wait();
  });

  describe('Get Opportunity Feed Items', function () {
    (new GetMatch({
      state, flow, logger, orderItemCriteria,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C1', function () {
    (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('C2', function () {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('B', function () {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();
  });

  describe('Orders Feed', function () {
    beforeAll(async function () {
      await flow.U();
    });

    it('Order Cancellation return 400 on fail', function () {
      expect(state.uResponse).to.have.status(400);
    });

    it('Order Cancellation should have PatchContainsExcessiveProperties as @type', function () {
      expect(state.uResponse.body['@type']).to.equal('PatchContainsExcessivePropertiesError');
      expect(state.uResponse.body['description']).to.equal('PATCH includes unexpected properties that are not permitted.');
    });
  });
});
