const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');
const { itShouldReturnAnOpenBookingError } = require('../../../../shared-behaviours/errors');


FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'simple-book-free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'payment-mismatch',
  testName: 'Expect a TotalPaymentDueMismatchError when the totalPaymentDue property is non-zero for free opportunities',
  testDescription: 'Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue)',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  describe('Total Payment Due mismatch at B', () => {
    // Setup
    const state = new RequestState(logger, { bReqTemplateRef: 'incorrectTotalPaymentDuePrice' });
    const flow = new FlowHelper(state);

    // Get Opportunity Feed Items that match criteria specified in describeFeature()
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

    // Run C1
    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    // Run C2
    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    // Run B
    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldReturnAnOpenBookingError('TotalPaymentDueMismatchError', 400, () => state.bResponse);
    });
  });
});
