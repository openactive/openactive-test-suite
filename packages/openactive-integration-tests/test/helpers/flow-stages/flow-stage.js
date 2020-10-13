const pMemoize = require('p-memoize');
// const sharedValidationTests = require('../../shared-behaviours/validation');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../../shared-behaviours/validation').ValidationMode} ValidationMode
 * @typedef {import('../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 */

/**
 * @template TFlowStageResponse
 * @typedef {{
 *   status: 'no-response-yet'
 * } | {
 *   status: 'pre-requisite-failed'
 * } | {
 *   status: 'response-received',
 *   response: TFlowStageResponse,
 * }} FlowStageResult
 */
/**
 * @typedef {object} FlowStageState
 * @property {string} [uuid] UUID used for Order
 * @property {OpportunityCriteria[]} [orderItemCriteriaList]
 * @property {ChakramResponse[]} [testInterfaceOpportunities] Opportunity
 *   references for opportunities used by this flow. These match the response
 *   schema for the POST /test-interface/datasets/:testDatasetIdentifier/opportunities
 *   (https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities)
 *   endpoint.
 * @property {ChakramResponse[]} [opportunityFeedExtractResponses]
 * @property {OrderItem[]} [orderItems]
 * @property {unknown} [bookingSystemOrder]
 */
/**
 * @template TFlowStageResponse
 * @typedef {{
 *   result: FlowStageResult<TFlowStageResponse>,
 *   state?: FlowStageState,
 * }} FlowStageOutput
 */
//  * @typedef {{
//  *   result: FlowStageResult,
//  *   state?: {
//  *     uuid?: string,
//  *     orderItemCriteria?: OpportunityCriteria[],
//  *     testInterfaceOpportunities?: ChakramResponse[],
//  *     opportunityFeedExtractResponses?: unknown,
//  *     orderItems?: unknown,
//  *     bookingSystemOrder?: unknown,
//  *   },
//  * }} FlowStageOutput

// * @param {() => Promise<FlowStageOutput>} args.runFn
// * @param {() => void} args.itSuccessChecksFn
// * @param {() => void} args.itValidationTestsFn
// * @param {{ name: string, validationMode: ValidationMode, opportunityCriteria?: string }} args.validationSpec
// runFn, itSuccessChecksFn, itValidationTestsFn,
// this._runFn = runFn;
// this._itSuccessChecksFn = itSuccessChecksFn;
// this._itValidationTestsFn = itValidationTestsFn;
// this._validationSpec = validationSpec;

// function createResponseReceivedFlowStageOutput

// /**
//  * @template TFlowStageResponse
//  * @typedef {object} FlowStageConstructorArgs
//  * @property {FlowStage} [args.prerequisite] Stage that must be completed before
//  *   this stage is run. e.g. a C2 stage might have a C1 stage as its
//  *   pre-requisite.
//  * @property {string} args.testName
//  * @property {(flowStage: FlowStage) => Promise<FlowStageOutput<TFlowStageResponse>>} args.runFn
//  * @property {(flowStage: FlowStage) => void} args.itSuccessChecksFn
//  * @property {(flowStage: FlowStage) => void} args.itValidationTestsFn
//  * @property {FlowStageOutput<TFlowStageResponse>['state']} [args.initialState] Set some initial
//  *   values for state e.g. use a pre-determined UUID.
//  */

// /**
//  * @typedef {object} FlowStageSpec
//  *
//  */

// const FlowStage = {
//   /**
//    * @template TFlowStageResponse
//    * @param {object} args
//    * @param {FlowStage} [args.prerequisite] Stage that must be completed before
//    *   this stage is run. e.g. a C2 stage might have a C1 stage as its
//    *   pre-requisite.
//    * @param {string} args.testName
//    * @param {(flowStage: FlowStage) => Promise<FlowStageOutput<TFlowStageResponse>>} args.runFn
//    * @param {(flowStage: FlowStage) => void} args.itSuccessChecksFn
//    * @param {(flowStage: FlowStage) => void} args.itValidationTestsFn
//    * @param {FlowStageOutput<TFlowStageResponse>['state']} [args.initialState] Set some initial
//    *   values for state e.g. use a pre-determined UUID.
//    */
//   create({ prerequisite, testName, runFn, itSuccessChecksFn, itValidationTestsFn, initialState }) {

//   },
// };

/**
 * A "stage" of a particular booking flow. For example, a flow might have
 * a stage for each of the following:
 *
 * - FetchOpportunities
 * - C1
 * - C2
 * - B
 *
 * @template TFlowStageResponse
 */
class FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage} [args.prerequisite] Stage that must be completed before
   *   this stage is run. e.g. a C2 stage might have a C1 stage as its
   *   pre-requisite.
   * @param {string} args.testName
   * @param {(flowStage: FlowStage<TFlowStageResponse>) => Promise<FlowStageOutput<TFlowStageResponse>>} args.runFn
   * @param {(flowStage: FlowStage<TFlowStageResponse>) => void} args.itSuccessChecksFn
   * @param {(flowStage: FlowStage<TFlowStageResponse>) => void} args.itValidationTestsFn
   * @param {FlowStageOutput<TFlowStageResponse>['state']} [args.initialState] Set some initial
   *   values for state e.g. use a pre-determined UUID.
   */
  // /**
  //  * @param {FlowStageConstructorArgs<TFlowStageResponse>} args
  //  */
  constructor({ prerequisite, testName, runFn, itSuccessChecksFn, itValidationTestsFn, initialState }) {
    this.testName = testName;
    this._prerequisite = prerequisite;
    this._runFn = runFn;
    this._itSuccessChecksFn = itSuccessChecksFn;
    this._itValidationTestsFn = itValidationTestsFn;
    this._initialState = initialState || {};
    /** @type {FlowStageOutput<TFlowStageResponse>} */
    this._output = {
      result: {
        status: 'no-response-yet',
      },
    };
  }

  // /**
  //  * @template TCreateFnFlowStageResponse
  //  * @param {FlowStageConstructorArgs<TCreateFnFlowStageResponse>} args
  //  */
  // static create(args) {
  //   return new FlowStage(args);
  // }

  /**
   * Note: This will throw an error if there is no response yet.
   */
  getResponse() {
    if (!('response' in this._output.result)) {
      throw new Error(`FlowStage(${this.testName}).getResponse() called but there is no response. FlowStage result: ${JSON.stringify(this._output.result)}`);
    }
    return this._output.result.response;
  }

  // /**
  //  * @returns {Promise<FlowStageOutput>}
  //  */
  // // eslint-disable-next-line class-methods-use-this
  // async _internalRun() {
  //   throw new Error('Not implemented');
  // }

  run = pMemoize(async () => {
    if (this._prerequisite) {
      await this._prerequisite.run();
    }
    const output = await this._runFn(this);
    // Merge the output with the initial state, so that the initial state
    // remains unless it is overridden.
    this._output = {
      ...output,
      state: {
        ...this._initialState,
        ...(output.state || {}),
      },
    };
  }, { cachePromiseRejection: true });

  beforeSetup() {
    beforeAll(async () => {
      await this.run();
    });
    return this;
  }

  // _internalItSuccessChecks

  /**
   * Check that the response received at this stage was successful.
   *
   * Creates it() blocks.
   */
  itSuccessChecks() {
    this._itSuccessChecksFn(this);
    return this;
  }

  /**
   * Check that the response received at this stage is valid according to the validator.
   *
   * Creates it() blocks.
   */
  itValidationTests() {
    this._itValidationTestsFn(this);
    return this;
    // sharedValidationTests.shouldBeValidResponse(
    //   () => (
    //     'response' in this._output.result
    //       ? this._output.result.response
    //       : null // If there is no response, we'll just give validator a null, which it will fail
    //   ),
    //   this._validationSpec.name,
    //   this._logger,
    //   {
    //     validationMode: this._validationSpec.validationMode,
    //   },
    //   this._validationSpec.opportunityCriteria || undefined,
    // );
    // return this;
  }

//  getDerivedState = memoize(() => {
//    merge(
//      this._output.state,
//      this._runAfter.getDerivedState(),
//    );
//  })
}

/**
 * @template TFlowStageResponse
 * @typedef {FlowStage<TFlowStageResponse>} FlowStageType
 */

module.exports = {
  FlowStage,
};
