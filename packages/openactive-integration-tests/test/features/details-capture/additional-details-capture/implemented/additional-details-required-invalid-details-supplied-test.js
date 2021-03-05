const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');

// TODO TODO TODO this test erroneously passes
FeatureHelper.describeFeature(module, {
  testCategory: 'details-capture',
  testFeature: 'additional-details-capture',
  testFeatureImplemented: true,
  testIdentifier: 'additional-details-required-invalid-details-supplied',
  testName: 'Booking opportunity with additional details supplied but not included',
  testDescription: 'Should error',
  testOpportunityCriteria: 'TestOpportunityBookable',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  function testInvalidAdditionalData(template) {
    const state = new RequestState(logger, {
      c1ReqTemplateRef: template,
      c2ReqTemplateRef: template,
      bReqTemplateRef: template,
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

      itShouldReturnAnOpenBookingError('InvalidIntakeFormError', 409, () => state.c1Response);
    });

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup();

      itShouldReturnAnOpenBookingError('InvalidIntakeFormError', 409, () => state.c2Response);
    });

    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldReturnAnOpenBookingError('InvalidIntakeFormError', 409, () => state.bResponse);
    });
  }

  testInvalidAdditionalData('additionalDetailsRequiredInvalidBooleanSupplied');
  testInvalidAdditionalData('additionalDetailsRequiredInvalidDropdownSupplied');
});
