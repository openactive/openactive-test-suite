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
  testIdentifier: 'incomplete-broker-details',
  testName: 'Expect an IncompleteBrokerDetailsError when broker details are missing name',
  testDescription: 'Run each of C1, C2 and B for a valid opportunity, with broker details incomplete (missing name), expecting an IncompleteBrokerDetailsError to be returned',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
(configuration, orderItemCriteria, featureIsImplemented, logger) => {
  /**
   * Fetch some opportunities and get matching ones
   *
   * Note: This generates jest blocks like `beforeAll()`, `it()`, etc. Therefore, this must be run within a `describe()` block
   *
   * @param {RequestState} state
   * @param {FlowHelper} state
   */
  function doFetchOpportunitiesAndGetMatches(state, flow) {
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
  }

  /**
   * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
   *   function because the actual response won't be available until the
   *   asynchronous before() block has completed.
   */
  function itShouldReturnAnIncompleteBrokerDetailsError(getChakramResponse) {
    it('should return an IncompleteBrokerDetailsError', () => {
      const chakramResponse = getChakramResponse();
      expect(chakramResponse.response).to.have.property('statusCode', 400);
      expect(chakramResponse.body).to.have.property('@type', 'IncompleteBrokerDetailsError');
      expect(chakramResponse.body).to.have.property('@context');
    });
  }

  describe('Incomplete Broker Details at C1', () => {
    const state = new RequestState(logger, { c1ReqTemplateRef: 'noBrokerName' });
    const flow = new FlowHelper(state);

    doFetchOpportunitiesAndGetMatches(state, flow);

    describe('C1', () => {
      (new C1({
        state, flow, logger,
      }))
        .beforeSetup();

      itShouldReturnAnIncompleteBrokerDetailsError(() => state.c1Response);
    });
  });

  describe('Incomplete Broker Details at C2', () => {
    const state = new RequestState(logger, { c2ReqTemplateRef: 'noBrokerName' });
    const flow = new FlowHelper(state);

    doFetchOpportunitiesAndGetMatches(state, flow);

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
        .beforeSetup();

      itShouldReturnAnIncompleteBrokerDetailsError(() => state.c2Response);
    });
  });
});
