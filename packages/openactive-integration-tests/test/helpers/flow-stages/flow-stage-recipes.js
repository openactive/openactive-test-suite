const RequestHelper = require('../request-helper');
const { BFlowStage } = require('./b');
const { C1FlowStage } = require('./c1');
const { C2FlowStage } = require('./c2');
const { FetchOpportunitiesFlowStage } = require('./fetch-opportunities');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../request-state').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 */

const FlowStageRecipes = {
  /**
   * Initialise Flow Stages for a simple FetchOpportunities -> C1 -> C2 -> B flow.
   *
   * Rather than setting custom input for each stage, the input is just fed automatically
   * from the output of previous stages.
   *
   * DO NOT USE THIS FUNCTION if you want to use custom inputs for each stage (e.g.
   * to create erroneous requests).
   *
   * @param {OpportunityCriteria[]} orderItemCriteriaList
   * @param {BaseLoggerType} logger
   */
  initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger) {
    const requestHelper = new RequestHelper(logger);

    // ## Initiate Flow Stages
    const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
      orderItemCriteriaList,
    });
    const c1 = new C1FlowStage({
      ...defaultFlowStageParams,
      prerequisite: fetchOpportunities,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
    });
    const c2 = new C2FlowStage({
      ...defaultFlowStageParams,
      prerequisite: c1,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
    });
    const b = new BFlowStage({
      ...defaultFlowStageParams,
      prerequisite: c2,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: c2.getOutput().totalPaymentDue,
      }),
    });

    return {
      c1, c2, b, requestHelper,
    };
  },
};

module.exports = {
  FlowStageRecipes,
};
