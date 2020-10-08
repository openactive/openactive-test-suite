const { FlowStage } = require('./flow-stage');

/**
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 * @typedef {import('../../templates/c1-req').C1ReqTemplateRef} C1ReqTemplateRef
 */

/**
 * @param {object} args
 * @param {C1ReqTemplateRef} [args.templateRef]
 * @returns {Promise<FlowStageOutput>}
 */
async function runC1({ templateRef, initialState }) {
  // TODO TODO TODO 
 }

const C1FlowStage = {
  /**
   * @param {object} args
   * @param {FlowStage} args.preRequisite
   * @param {BaseLoggerType} args.logger
   * @param {C1ReqTemplateRef} [args.templateRef]
   */
  create({ preRequisite, logger, templateRef }) {
    return new FlowStage({
      preRequisite,
      logger,
      testName: 'C1',
      runFn: () => runC1({ templateRef }),
      itSuccessChecksFn: () => { }, // TODO TODO TODO
      validationSpec: {
        name: 'C1',
        validationMode: 'C1Response',
      },
    });
  },
};

module.exports = {
  C1FlowStage,
};
