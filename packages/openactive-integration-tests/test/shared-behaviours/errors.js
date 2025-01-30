const { expect } = require('chai');
const { FlowStageUtils } = require('../helpers/flow-stages');
const { Common } = require('.');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../helpers/flow-stages/fetch-opportunities').OrderItem} OrderItem
 * @typedef {import('../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
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
  it(`should return a response containing \`"@type": "${errorType}"\` with status code \`${statusCode}\``, () => {
    const chakramResponse = getChakramResponse();
    expect(chakramResponse.response).to.have.property('statusCode', statusCode);
    expect(chakramResponse.body).to.have.property('@type', errorType);
    expect(chakramResponse.body).to.have.property('@context');
  });
}

/**
 * Run a check against each OrderItem in an API response to ensure that the specified error is only returned for the primary OrderItems.
 *
 * Note: This generates an it() block. Therefore, this must be run within a describe() block.
 *
 * @param {string} orderItemErrorType OrderItem error expected for testOpportunityCriteria, and not for controlOpportunityCriteria.
 * @param {object} args
 * @param {OpportunityCriteria[]} args.orderItemCriteriaList List of Order Item Criteria as provided by
 *   FeatureHelper.
 * @param {() => OrderItem[]} args.getFeedOrderItems OrderItems as received from the feed (e.g. using the
 *   FetchOpportunitiesFlowStage)
 * @param {() => ChakramResponse} args.getOrdersApiResponse HTTP response from an Orders API that includes
 *   OrderItems in the `.orderedItem` field. e.g. C1, C2 or B.
 */
function itShouldIncludeErrorForOnlyPrimaryOrderItems(orderItemErrorType, {
  orderItemCriteriaList,
  getFeedOrderItems,
  getOrdersApiResponse,
}) {
  // All OrderItem errors should result in a 409 Conflict status code response
  itShouldReturnHttpStatus(409, getOrdersApiResponse);

  Common.itForEachOrderItemByControl({
    orderItemCriteriaList,
    getFeedOrderItems,
    getOrdersApiResponse,
  },
  `should include an ${orderItemErrorType}`,
  (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
    expect(responseOrderItemErrorTypes).to.include(orderItemErrorType);
  },
  `should not include an ${orderItemErrorType}`,
  (feedOrderItem, responseOrderItem, responseOrderItemErrorTypes) => {
    expect(responseOrderItemErrorTypes).not.to.include(orderItemErrorType);
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
   * @param {import('../helpers/flow-stages/flow-stage-run').AnyFlowStageRun} [flowStageRun]
   */
  const runFlowStageFn = (flowStage, flowStageRun) => {
    const runnable = flowStageRun ?? flowStage;
    FlowStageUtils.describeRunAndCheckIsValid(runnable, () => {
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
  itShouldIncludeErrorForOnlyPrimaryOrderItems,
  runFlowStageAndExpectIncompleteBrokerDetailsError,
  runFlowStageAndExpectIncompleteCustomerDetailsError,
};
