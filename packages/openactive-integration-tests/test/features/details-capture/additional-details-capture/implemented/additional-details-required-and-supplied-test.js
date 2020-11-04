const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-and-supplied',
  testName: 'Booking opportunity with additional details supplied and included',
  testDescription: 'Should pass',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  const state = new RequestState(logger, {
    c1ReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
    c2ReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
    bReqTemplateRef: 'additionalDetailsRequiredAndSupplied',
  });
  const flow = new FlowHelper(state);

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
      .successChecks();
    // .validationTests();
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks();
    // .validationTests();
  });

  describe('B', () => {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .successChecks();
    // .validationTests();
  });
});
