const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-but-not-supplied',
  testName: 'Booking opportunity with additional details supplied but not included',
  testDescription: 'Should error',
  // TODO TODO TODO a criteria which requires orderIntakeForm
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  const state = new RequestState(logger, {
    // c1ReqTemplateRef: 'additionalDetailsRequiredNotSupplied',
    // c2ReqTemplateRef: 'additionalDetailsRequiredNotSupplied',
    // bReqTemplateRef: 'additionalDetailsRequiredNotSupplied',
    c1ReqTemplateRef: 'standard',
    c2ReqTemplateRef: 'standard',
    bReqTemplateRef: 'standardPaid',
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
      .beforeSetup();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.c1Response);
  });

  describe('C2', () => {
    (new C2({
      state, flow, logger,
    }))
      .beforeSetup();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.c2Response);
  });

  describe('B', () => {
    (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    itShouldReturnAnOpenBookingError('IncompleteAttendeeDetailsError', 409, () => state.bResponse);
  });
});
