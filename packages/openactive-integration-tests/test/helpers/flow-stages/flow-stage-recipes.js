const RequestHelper = require('../request-helper');
const { BFlowStage } = require('./b');
const { C1FlowStage } = require('./c1');
const { C2FlowStage } = require('./c2');
const { FetchOpportunitiesFlowStage } = require('./fetch-opportunities');
const { FlowStageUtils } = require('./flow-stage-utils');

/**
 * @typedef {import('../request-state').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 * @typedef {import('../../templates/c2-req').C2ReqTemplateRef} C2ReqTemplateRef
 * @typedef {import('../../templates/b-req').BReqTemplateRef} BReqTemplateRef
 */

/**
 * @typedef {{
 *   c1ReqTemplateRef?: C1ReqTemplateRef | null,
 *   c2ReqTemplateRef?: C2ReqTemplateRef | null,
 *   bReqTemplateRef?: BReqTemplateRef | null,
 * }} OptionalC1C2BReqTemplateRefs
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
   * @param {OptionalC1C2BReqTemplateRefs} [options]
   */
  initialiseSimpleC1C2BFlow(orderItemCriteriaList, logger, { c1ReqTemplateRef = null, c2ReqTemplateRef = null, bReqTemplateRef = null } = {}) {
    const requestHelper = new RequestHelper(logger);

    // ## Initiate Flow Stages
    const defaultFlowStageParams = FlowStageUtils.createDefaultFlowStageParams({ requestHelper, logger });
    const fetchOpportunities = new FetchOpportunitiesFlowStage({
      ...defaultFlowStageParams,
      orderItemCriteriaList,
    });
    const c1 = new C1FlowStage({
      ...defaultFlowStageParams,
      templateRef: c1ReqTemplateRef,
      prerequisite: fetchOpportunities,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
    });
    const c2 = new C2FlowStage({
      ...defaultFlowStageParams,
      templateRef: c2ReqTemplateRef,
      prerequisite: c1,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
      }),
    });
    const b = new BFlowStage({
      ...defaultFlowStageParams,
      templateRef: bReqTemplateRef,
      prerequisite: c2,
      getInput: () => ({
        orderItems: fetchOpportunities.getOutput().orderItems,
        totalPaymentDue: c2.getOutput().totalPaymentDue,
      }),
    });

    return {
      requestHelper,
      fetchOpportunities,
      c1,
      c2,
      b,
    };
  },
};

module.exports = {
  FlowStageRecipes,
};
