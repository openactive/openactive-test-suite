const { FlowStageRecipes, FlowStageUtils } = require('../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../helpers/flow-helper').FlowHelperType} FlowHelperType
 * @typedef {import('../../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../../helpers/request-state').RequestStateType} RequestStateType
 * @typedef {import('../../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 * @typedef {import('../../../helpers/flow-stages/flow-stage-recipes').InitialiseSimpleC1C2BFlowOptions} InitialiseSimpleC1C2BFlowOptions
 */

/**
 * @param {InitialiseSimpleC1C2BFlowOptions} [reqTemplateRefs]
 */
function notImplementedTest(reqTemplateRefs) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, reqTemplateRefs);

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(b);
  };
  return runTestsFn;
}

/**
 * Test that runs C1 -> C2 -> B and expects B to fail with an InvalidPaymentDetailsError.
 *
 * @param {BReqTemplateRef} bReqTemplateRef
 */
function invalidDetailsTest(bReqTemplateRef) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2, b } = FlowStageRecipes.initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { bReqTemplateRef });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(b, () => {
      itShouldReturnAnOpenBookingError('InvalidPaymentDetailsError', 400, () => b.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

module.exports = {
  invalidDetailsTest,
  notImplementedTest,
};
