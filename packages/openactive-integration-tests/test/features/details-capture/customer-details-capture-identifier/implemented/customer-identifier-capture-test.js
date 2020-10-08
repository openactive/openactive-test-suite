/* eslint-disable no-unused-vars */
const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');

/* eslint-enable no-unused-vars */

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'customer-details-capture-identifier',
  testFeatureImplemented: true,
  testIdentifier: 'customer-identifier-capture',
  testName: 'Customer identifier is reflected back at C2 and B',
  testDescription: 'Identifier from the Customer supplied by Broker should be reflected back by booking system.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) {
  describe('Customer identifier reflected back at C2 and B', () => {
    beforeAll(async function () {
      await state.fetchOpportunities(orderItemCriteria);
      return chakram.wait();
    });

    afterAll(async function () {
      await state.deleteOrder();
      return chakram.wait();
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

    describe('C2', function () {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      it('should return 200, with an Expected customer identifier', () => {
        chai.expect(state.c2Response.response.statusCode).to.equal(200);
        chai.expect(state.c2Response.body.customer.identifier).to.equal('CustomerIdentifier');
      });
    });

    describe('B', function () {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .itResponseReceived()
        .validationTests();

      it('should return 200, with an Expected customer identifier', () => {
        chai.expect(state.bResponse.response.statusCode).to.equal(200);
        chai.expect(state.bResponse.body.customer.identifier).to.equal('CustomerIdentifier');
      });
    });
  });
});
