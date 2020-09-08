const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { FlowHelper } = require('../../../../helpers/flow-helper');
const { RequestState } = require('../../../../helpers/request-state');
const { GetMatch, C1, C2, B } = require('../../../../shared-behaviours');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'common-error-conditions',
  testFeatureImplemented: true,
  testIdentifier: 'incomplete-customer-details',
  testName: 'Expect an IncompleteCustomerDetailsError when customer details are incomplete',
  testDescription: 'Run each of C2 and B for a valid opportunity, with customer details incomplete, expecting an IncompleteCustomerDetailsError to be returned (C1 is ignored because customer details are not accepted for C1)',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
  numOpportunitiesUsedPerCriteria: 2, // one for each of the C2 and B tests
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  /**
   * Fetch some opportunities and run C1
   *
   * Note: This generates jest blocks like `beforeAll()`, `it()`, etc. Therefore, this must be run within a `describe()` block
   *
   * @param {RequestState} state
   * @param {FlowHelper} state
   */
  function runC1(state, flow) {
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

    return { state, flow };
  }

  /**
   * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
   *   function because the actual response won't be available until the
   *   asynchronous before() block has completed.
   */
  function itShouldReturnAnIncompleteCustomerDetailsError(getChakramResponse) {
    it('should return an IncompleteCustomerDetailsError', () => {
      const chakramResponse = getChakramResponse();
      expect(chakramResponse.response).to.have.property('statusCode', 400);
      expect(chakramResponse.body).to.have.property('@type', 'IncompleteCustomerDetailsError');
      expect(chakramResponse.body).to.have.property('@context');
    });
  }

  describe('Incomplete Customer Details at C2', () => {
    const state = new RequestState(logger, { c2ReqTemplateRef: 'noCustomerEmail' });
    const flow = new FlowHelper(state);

    runC1(state, flow);

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup();

      itShouldReturnAnIncompleteCustomerDetailsError(() => state.c2Response);
    });
  });

  describe('Incomplete Customer Details at B', () => {
    const state = new RequestState(logger, { bReqTemplateRef: 'noCustomerEmail' });
    const flow = new FlowHelper(state);

    runC1(state, flow);

    describe('C2', () => {
      (new C2({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();
    });

    describe('B', () => {
      (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .validationTests();

      itShouldReturnAnIncompleteCustomerDetailsError(() => state.bResponse);
    });
  });
});
