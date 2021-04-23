const { expect } = require('chai');
const { FlowStageUtils } = require('../helpers/flow-stages');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../helpers/flow-stages/flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('../helpers/flow-stages/flow-stage').FlowStageType<
 *   unknown,
 *   Required<Pick<FlowStageOutput, 'httpResponse'>>
 * >} FlowStageWhichOutputsHttpResponse
 */

/**
 * @param {number} statusCode Expected HTTP status
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnHttpStatus(statusCode, getChakramResponse) {
  it(`should return HTTP ${statusCode}`, () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.response).to.have.property('statusCode', statusCode);
  });
}

/**
 * @param {string} errorType e.g. IncompleteBrokerDetailsError
 * @param {number} statusCode Expected HTTP status
 * @param {() => ChakramResponse} getChakramResponse This is wrapped in a
 *   function because the actual response won't be available until the
 *   asynchronous before() block has completed.
 */
function itShouldReturnAnOpenBookingError(errorType, statusCode, getChakramResponse) {
  it(`should return a(n) ${errorType}`, () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.response).to.have.property('statusCode', statusCode);
    expect(chakramResponse.body).to.have.property('@type', errorType);
    expect(chakramResponse.body).to.have.property('@context');
  });
}

/**
 * Run the flowStage (in a describe block) and expect it to return a given OpenBookingError
 *
 * @param {string} errorType e.g. IncompleteBrokerDetailsError
 * @param {number} statusCode Expected HTTP status
 */
function createRunFlowStageAndExpectOpenBookingErrorFn(errorType, statusCode) {
  /**
   * @param {FlowStageWhichOutputsHttpResponse} flowStage
   */
  const runFlowStageFn = (flowStage) => {
    FlowStageUtils.describeRunAndCheckIsValid(flowStage, () => {
      itShouldReturnAnOpenBookingError(errorType, statusCode, () => flowStage.getOutput().httpResponse);
    });
  };
  return runFlowStageFn;
}

const runFlowStageAndExpectIncompleteBrokerDetailsError = createRunFlowStageAndExpectOpenBookingErrorFn('IncompleteBrokerDetailsError', 400);
const runFlowStageAndExpectIncompleteCustomerDetailsError = createRunFlowStageAndExpectOpenBookingErrorFn('IncompleteCustomerDetailsError', 400);

module.exports = {
  itShouldReturnHttpStatus,
  itShouldReturnAnOpenBookingError,
  runFlowStageAndExpectIncompleteBrokerDetailsError,
  runFlowStageAndExpectIncompleteCustomerDetailsError,
};
