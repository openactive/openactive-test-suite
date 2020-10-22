const chakram = require('chakram');
const config = require('config');
const sharedValidationTests = require('../../shared-behaviours/validation');
const { generateUuid } = require('../generate-uuid');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../../helpers/request-helper').RequestHelperType} RequestHelperType
 * @typedef {import('../../shared-behaviours/validation').ValidationMode} ValidationMode
 * @typedef {import('./flow-stage').FlowStageOutput} FlowStageOutput
 *
 * @typedef {import('./flow-stage').FlowStageType<unknown, unknown>} UnknownFlowStageType
 * @typedef {import('./flow-stage').FlowStageType<
 *   unknown,
 *   Required<Pick<FlowStageOutput, 'httpResponse'>>,
 * >} FlowStageTypeWithHttpResponseOutput
 */

//  *   Required<Pick<FlowStageOutput, 'httpResponse'>> & Omit<FlowStageOutput, 'httpResponse'>
// /**
//  * @template TFlowStageResponse
//  * @typedef {object} FlowStageDefinition
//  * @property {string} testName
//  * @property {FlowStageDefinition<unknown>} prerequisite
//  * @property {(stateSoFar: FlowStageState) => Promise<import('./flow-stage').FlowStageOutput<TFlowStageResponse>>} runFn
//  * @property {(response: TFlowStageResponse, stateSoFar: FlowStageState) => void} itSuccessChecksFn
//  * @property {(response: TFlowStageResponse, stateSoFar: FlowStageState) => void} itValidationTestsFn
//  */
//  * @template {FlowStageTypeWithHttpResponseOutput} TFlowStageType
// { getOutput: () => { httpResponse: ChakramResponse }}

const SELLER_CONFIG = config.get('sellers');

const FlowStageUtils = {
  // # Utilities for FlowStage factory
  //
  // e.g. for C1FlowStage
  /**
   * Empty `getInput` arg to use for FlowStages which need no input.
   */
  emptyGetInput: () => ({}),

  /**
   * Create itValidationTestsFn that will work for flow stages whose output
   * inclues an HTTP response (`httpResponse`) whose body is an OpenActive item.
   *
   * Runs sharedValidationTests.shouldBeValidResponse() against the response.
   *
   * @param {BaseLoggerType} logger
   * @param {object} validationSpec
   * @param {string} validationSpec.name Name to use for tests generated by
   *   validation checks.
   * @param {ValidationMode} validationSpec.validationMode
   */
  simpleValidationTests(logger, { name, validationMode }) {
    return (/** @type {FlowStageTypeWithHttpResponseOutput} */ flowStage) => {
      sharedValidationTests.shouldBeValidResponse(
        () => flowStage.getOutput().httpResponse,
        name,
        logger,
        {
          validationMode,
        },
      );
    };
  },

  // /**
  //  * @template {Required<Pick<FlowStageOutput, 'httpResponse'>>} TOutput
  //  * @param {import('./flow-stage').FlowStageType<unknown, TOutput>} flowStage
  //  * @param {object} validationSpec
  //  * @param {string} validationSpec.name Name to use for tests generated by
  //  *   validation checks.
  //  * @param {ValidationMode} validationSpec.validationMode
  //  * @param {BaseLoggerType} logger
  //  */
  // simpleValidationTests(flowStage, { name, validationMode }, logger) {
  //   sharedValidationTests.shouldBeValidResponse(
  //     () => flowStage.getOutput().httpResponse,
  //     name,
  //     logger,
  //     {
  //       validationMode,
  //     },
  //   );
  // },

  /**
   * Create itSuccessChecksFn that will just check that a FlowStage's result
   * has an HTTP XXX status (e.g. 204).
   *
   * This only works for FlowStages whose result is just an HTTP response.
   *
   * @param {number} expectedStatus
   */
  simpleHttpXXXSuccessChecks(expectedStatus) {
    return (/** @type {FlowStageTypeWithHttpResponseOutput} */ flowStage) => {
    // return (/** @type {import('./flow-stage').FlowStageType<any, TOutput>} */ flowStage) => {
      it(`should return ${expectedStatus} on success`, () => {
        chakram.expect(flowStage.getOutput().httpResponse).to.have.status(expectedStatus);
      });
    };
  },

  /**
   * Create itSuccessChecksFn that will just check that a FlowStage's result
   * has an HTTP 200 status.
   *
   * This only works for FlowStages whose result is just an HTTP response.
   */
  simpleHttp200SuccessChecks() {
    return FlowStageUtils.simpleHttpXXXSuccessChecks(200);
  },

  // # Utilities for test specs

  /**
   * @param {object} args
   * @param {RequestHelperType} args.requestHelper
   * @param {BaseLoggerType} args.logger
   * @param {string} [args.uuid]
   * @param {string} [args.sellerId]
   */
  createDefaultFlowStageParams({ requestHelper, logger, uuid, sellerId }) {
    return {
      requestHelper,
      logger,
      uuid: uuid || generateUuid(),
      sellerId: sellerId || /** @type {string} */(SELLER_CONFIG.primary['@id']),
    };
  },

  /**
   * Creates a `describe(..)` block in which:
   *
   * 1. Runs the flow stage in a `beforeAll(..)` block.
   * 2. Runs success checks and validation checks of the response in `it(..)` blocks.
   * 3. Optionally runs extra tests.
   *
   * @param {UnknownFlowStageType} flowStage
   * @param {object} options
   * @param {() => void} [options.itAdditionalTests] Additiona tests which will
   *   be run after success and validation tests have run.
   *   These tests need to create `it(..)` blocks for each of the new tests.
   *   The tests will be run within the same `describe(..)` block as
   *   success/validation tests.
   */
  describeRunAndCheckIsSuccessfulAndValid(flowStage, options = {}) {
    if (!flowStage.shouldDescribeFlowStage) {
      throw new Error(`describeRunAndCheckIsSuccessfulAndValid(..) cannot run on ${flowStage.getLoggableStageName()} as shouldDescribeFlowStage is false`);
    }
    describe(flowStage.testName, () => {
      flowStage
        .beforeSetup()
        .itSuccessChecks()
        .itValidationTests();

      if (options.itAdditionalTests) {
        options.itAdditionalTests();
      }
    });
  },

  // /**
  //  * @template {{
  //  *   orderItems?: import('./flow-stage').FlowStageType<unknown, Pick<FlowStageOutput, 'orderItems'>>,
  //  * }} TGetInputFromStagesSpec
  //  * @param {TGetInputFromStagesSpec} spec
  //  * @returns {() => Pick<FlowStageOutput, keyof TGetInputFromStagesSpec>}
  //  */
  // getInputFromStages(spec) {
  //   return () => {
  //     const input = {};
  //     for (const [fieldName, stage] of Object.entries(spec)) {
  //       input[fieldName] = stage.getOutput()[fieldName];
  //     }
  //     return /** @type {Pick<FlowStageOutput, keyof TGetInputFromStagesSpec>} */(input);
  //   }
  // },

//   /**
//    * Simple flow:
//    *
//    * - Each stage uses state from its prerequisite stages (though this can be overridden)
//    *
//    * @template {{
//    *   flowStagesByLabel: any,
//    *   flowStageOrder: string[],
//    *   logger: BaseLoggerType,
//    *   requestHelper: RequestHelperType,
//    * }} TInitialFlow
//    * @template {string} TSpecLabel
//    * @template {(args: any) => import('./flow-stage').FlowStageType<any>} TCreateFlowStageFn
//    *
//    * @param {TInitialFlow} flow
//    * @param {[
//    *   label: TSpecLabel,
//    *   createFlowStageFn: TCreateFlowStageFn,
//    *   flowStageArgsOrFn?:
//    *     | (Omit<Parameters<TCreateFlowStageFn>[0], 'prerequisite' | 'logger' | 'requestHelper'>)
//    *     | (
//    *       (flowStagesByLabel: TInitialFlow['flowStagesByLabel']) =>
//    *         Omit<Parameters<TCreateFlowStageFn>[0], 'prerequisite' | 'logger' | 'requestHelper'>)
//    * ]} spec TODO TODO document this param
//    * @returns {{
//    *   flowStagesByLabel: TInitialFlow['flowStagesByLabel'] & {
//    *     [label in TSpecLabel]: ReturnType<TCreateFlowStageFn>;
//    *   },
//    *   flowStageOrder: string[],
//    *   logger: BaseLoggerType,
//    *   requestHelper: RequestHelperType,
//    * }}
//    */
//   buildSimpleFlow(flow, spec) {
//     const [label, createFlowStageFn, flowStageArgsOrFn] = spec;
//     const prerequisite = (flow.flowStageOrder.length > 0)
//       // The prerequisite is set as the last item so far
//       ? flow.flowStagesByLabel[flow.flowStageOrder[flow.flowStageOrder.length - 1]]
//       : null;
//     const { logger, requestHelper } = flow;
//     const initialFlowStageArgs = (typeof flowStageArgsOrFn === 'function')
//       ? flowStageArgsOrFn(flow.flowStagesByLabel)
//       : (flowStageArgsOrFn || {});
//     const boilerplatedFlowStageArgs = {
//       ...initialFlowStageArgs,
//       prerequisite,
//       logger,
//       requestHelper,
//     };
//     const flowStage = createFlowStageFn(boilerplatedFlowStageArgs);
//     return {
//       flowStagesByLabel: {
//         ...flow.flowStagesByLabel,
//         label: flowStage,
//       },
//       flowStageOrder: [...flow.flowStageOrder, label],
//       logger: flow.logger,
//       requestHelper: flow.requestHelper,
//     };
//   },
};

// /**
//  * @template {keyof FlowStageOutput} TOutputFieldName
//  * @template {any[]} TInitialValue
//  */
// class InputBuilder {
//   /**
//    * @param {import('./flow-stage').FlowStageType<unknown, Pick<FlowStageOutput, TOutputFieldName>>} flowStage
//    * @param {TOutputFieldName} outputFieldName
//    * @param {TInitialValue} initialValue
//    */
//   constructor(flowStage, outputFieldName, initialValue) {
//     this._flowStage = flowStage;
//     this._outputFieldName = outputFieldName;
//     this._initialValue = initialValue;
//   }

//   get() {
//     return () => ({
//       ...this._initialValue,
      
//     });
//   }

//   /**
//    * @template {keyof FlowStageOutput} TNewOutputFieldName
//    * @param {import('./flow-stage').FlowStageType<unknown, Pick<FlowStageOutput, TOutputFieldName>>} flowStage
//    * @param {TNewOutputFieldName} outputFieldName
//    */
//   add(flowStage, outputFieldName) {
//     return new InputBuilder(flowStage, outputFieldName, [
//       ...this._initialValue,
//       [flowStage, outputFieldName],
//     ]);
//   }
// }

// const flow1 = FlowStageUtils.buildFlow({
//   flowStagesByLabel: {},
//   flowStageOrder: [],
//   logger: null,
//   requestHelper: null,
// }, ['c1', C1FlowStage.create, { templateRef: 'standard' }]);
// const flow2 = FlowStageUtils.buildFlow(flow1, ['c2', C2FlowStage.create]);
// const flow3 = FlowStageUtils.buildFlow(flow2, ['p', PFlowStage.create]);
// const flow4 = FlowStageUtils.buildFlow(flow3, ['simulateSellerApproval', TestInterfaceActionFlowStage.create, ({ p }) => ({
//   testName: 'Simulate Seller Approval (Test Interface Action)',
//   createActionFn: () => ({
//     type: 'test:SellerAcceptOrderProposalSimulateAction',
//     objectType: 'OrderProposal',
//     objectId: p.getResponse().body['@id'],
//   }),
// })]);
// console.log(flow4);

module.exports = {
  FlowStageUtils,
};
