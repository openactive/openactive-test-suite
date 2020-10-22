const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { multipleOpportunityCriteriaTemplate, itShouldHavePrepayment } = require('../../prepayment-common');
const chakram = require('chakram');
const expect = require('chai').expect;

const testOpportunityCriteria = 'TestOpportunityBookablePaidPrepaymentUnavailable';
const expectedPrepayment = 'https://openactive.io/Unavailable';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Opportunity paid',
  testDescription: 'Opportunity paid, prepayment unavailable',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
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
    const c1 = (new C1({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    itShouldHavePrepayment(expectedPrepayment, c1, () => state.c1Response);
  });

  describe('C2', () => {
    const c2 = (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks()
      .validationTests();

    itShouldHavePrepayment(expectedPrepayment, c2, () => state.c2Response);
  });

  describe('B', () => {
    const b = (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    it('should return a response', () => {
      b.expectResponseReceived();
    });

    it('should return 409', () => {
      chakram.expect(state.bResponse).to.have.status(400);
    });

    it('should return a UnnecessaryPaymentDetailsError', () => {
      chakram.expect(state.bResponse.body['@type']).to.equal('UnnecessaryPaymentDetailsError');
    });
  });
});
