const { FlowStageRecipes, FlowStageUtils } = require('../../../helpers/flow-stages');
const { itShouldReturnAnOpenBookingError } = require('../../../shared-behaviours/errors');

/**
 * @typedef {import('../../../helpers/flow-helper').FlowHelperType} FlowHelperType
 * @typedef {import('../../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../../helpers/request-state').RequestStateType} RequestStateType
 * @typedef {import('../../../templates/b-req').PReqTemplateRef} PReqTemplateRef
 * @typedef {import('../../../helpers/flow-stages/flow-stage-recipes').InitialiseSimpleC1C2BookFlowOptions} InitialiseSimpleC1C2BookFlowOptions
 */

/**
 * @param {InitialiseSimpleC1C2BookFlowOptions} [reqTemplateRefs]
 */
function notImplementedTest(reqTemplateRefs) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, reqTemplateRefs);

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(bookRecipe);
  };
  return runTestsFn;
}

/**
 * Test that runs C1 -> C2 -> B and expects B to fail with an InvalidPaymentDetailsError.
 *
 * @param {PReqTemplateRef} bookReqTemplateRef
 */
function invalidDetailsTest(bookReqTemplateRef) {
  /** @type {import('../../../helpers/feature-helper').RunTestsFn} */
  const runTestsFn = (configuration, orderItemCriteriaList, featureIsImplemented, logger) => {
    const { fetchOpportunities, c1, c2, bookRecipe } = FlowStageRecipes.initialiseSimpleC1C2BookFlow(orderItemCriteriaList, logger, { bookReqTemplateRef });

    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(fetchOpportunities);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c1);
    FlowStageUtils.describeRunAndCheckIsSuccessfulAndValid(c2);
    FlowStageUtils.describeRunAndCheckIsValid(bookRecipe.firstStage, () => {
      itShouldReturnAnOpenBookingError('InvalidPaymentDetailsError', 400, () => bookRecipe.firstStage.getOutput().httpResponse);
    });
  };
  return runTestsFn;
}

module.exports = {
  invalidDetailsTest,
  notImplementedTest,
};
