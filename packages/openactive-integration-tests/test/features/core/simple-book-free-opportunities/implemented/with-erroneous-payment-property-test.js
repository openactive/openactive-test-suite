const chai = require('chai');
const chakram = require('chakram');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'simple-book-free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'with-erroneous-payment-property',
  testName: 'Fail free bookings which include erroneous payment property',
  testDescription: 'C1, C2 and B with payment property: payment property is provided but not expected in the request, so an UnnecessaryPaymentDetailsError must be returned.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  // This must also be TestOpportunityBookableFree as the payment property is only disallowed if ALL items are free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  const state = new RequestState(logger, {
    // the `standardPaid` B request template has the `payment` property
    bReqTemplateRef: 'standardPaid',
  });
  const flow = new FlowHelper(state);

  beforeAll(async function () {
    await state.fetchOpportunities(orderItemCriteria);

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
      .itResponseReceived()
      .validationTests();

    it('should return 400, with an UnnecessaryPaymentDetailsError error', () => {
      chai.expect(state.bResponse.response.statusCode).to.equal(400);
      chai.expect(state.bResponse.body).to.have.property('@type', 'UnnecessaryPaymentDetailsError');
    });
  });
});
