const chakram = require('chakram');
const { expect } = require('chai');
const { GetMatch, C1, C2, B } = require('../../../shared-behaviours');
const { RequestState } = require('../../../helpers/request-state');
const { FlowHelper } = require('../../../helpers/flow-helper');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import("../../../shared-behaviours/common").C1} C1
 * @typedef {import("../../../shared-behaviours/common").C1} C2
 * @typedef {import("../../../shared-behaviours/common").C1} B
 */

/**
 * @param {string} expected
 * @param {C1|C2|B} stage
 * @param {() => ChakramResponse} responseAccessor This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldHavePrepayment(expected, stage, responseAccessor) {
  it('should return prepayment', () => {
    stage.expectResponseReceived();
    const response = responseAccessor().body;

    expect(response.totalPaymentDue.prepayment).to.equal(expected);
  });
}

function multipleOpportunityCriteriaTemplate(testOpportunityCriteria) {
  return opportunityType => [{
    opportunityType,
    opportunityCriteria: testOpportunityCriteria,
    primary: true,
    control: false,
  }];
}

function commonTests(expectedPrepayment, state, flow, logger, orderItemCriteria) {
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
}

function commonErrorTests(expectedPrepayment, expectedError, state, flow, logger, orderItemCriteria) {
  commonTests(expectedPrepayment, state, flow, logger, orderItemCriteria);

  describe('B', () => {
    const b = (new B({
      state, flow, logger,
    }))
      .beforeSetup()
      .validationTests();

    it('should return a response', () => {
      b.expectResponseReceived();
    });

    it('should return 400', () => {
      chakram.expect(state.bResponse).to.have.status(400);
    });

    it(`should return a ${expectedError}`, () => {
      expect(state.bResponse.body['@type']).to.equal(expectedError);
    });
  });
}

/**
 * @param {"https://openactive.io/Required"|"https://openactive.io/Optional"|"https://openactive.io/Unavailable"} expectedPrepayment
 */
function successTests(expectedPrepayment) {
  return (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
    commonTests(expectedPrepayment, state, flow, logger, orderItemCriteria);

    describe('B', () => {
      const b = (new B({
        state, flow, logger,
      }))
        .beforeSetup()
        .successChecks()
        .validationTests();

      itShouldHavePrepayment(expectedPrepayment, b, () => state.bResponse);
    });
  };
}

/**
 * @param {"https://openactive.io/Required"|"https://openactive.io/Optional"|"https://openactive.io/Unavailable"} expectedPrepayment
 * @param {"MissingPaymentDetailsError"|"UnnecessaryPaymentDetailsError"} expectedError
 * @param {"incorrectOrderDueToMissingPaymentProperty"} bReqTemplateRef
 */
function errorTests(expectedPrepayment, expectedError, bReqTemplateRef = null) {
  if (bReqTemplateRef == null) {
    return (configuration, orderItemCriteria, featureIsImplemented, logger, state, flow) => {
      commonErrorTests(expectedPrepayment, expectedError, state, flow, logger, orderItemCriteria);
    };
  }

  const missingOrUnnecessary = expectedError === 'MissingPaymentDetailsError'
    ? 'Missing'
    : 'Unnecessary';

  return (configuration, orderItemCriteria, featureIsImplemented, logger) => {
    describe(`${missingOrUnnecessary} payment property at B`, () => {
      const state = new RequestState(logger, { bReqTemplateRef });
      const flow = new FlowHelper(state);

      commonErrorTests(expectedPrepayment, expectedError, state, flow, logger, orderItemCriteria);
    });
  };
}

module.exports = {
  itShouldHavePrepayment,
  multipleOpportunityCriteriaTemplate,
  successTests,
  errorTests,
};
