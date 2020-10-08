const pMemoize = require('p-memoize');
const sharedValidationTests = require('../../shared-behaviours/validation');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../shared-behaviours/validation').ValidationMode} ValidationMode
 * @typedef {import('../../helpers/logger').BaseLoggerType} BaseLoggerType
 */

/**
 * @typedef {{
 *   status: 'no-response-yet'
 * } | {
 *   status: 'pre-requisite-failed'
 * } | {
 *   status: 'response-received',
 *   response: ChakramResponse,
 * }} FlowStageResult
 *
 * @typedef {{
 *   result: FlowStageResult,
 *   state?: {
 *     opportunityFeedExtractResponses?: unknown,
 *     orderItems?: unknown,
 *     bookingSystemOrder?: unknown,
 *     uuid?: string,
 *   },
 * }} FlowStageOutput
 */

/**
 * A "stage" of a particular booking flow. For example, a flow might have
 * a stage for each of the following:
 *
 * - FetchOpportunities
 * - C1
 * - C2
 * - B
 */
class FlowStage {
  /**
  * @param {object} args
  * @param {FlowStage} args.preRequisite Stage that must be completed before
  *   this stage is run. e.g. a C2 stage might have a C1 stage as its
  *   pre-requisite.
  * @param {BaseLoggerType} args.logger
  * @param {string} args.testName
  * @param {() => Promise<FlowStageOutput>} args.runFn
  * @param {() => void} args.itSuccessChecksFn
  * @param {{ name: string, validationMode: ValidationMode, opportunityCriteria?: string }} args.validationSpec
  * @param {FlowStageOutput['state']} [args.initialState] Set some initial
  *   values for state e.g. use a pre-determined UUID.
  */
  constructor({ preRequisite, logger, testName, runFn, itSuccessChecksFn, validationSpec, initialState }) {
    this._preRequisite = preRequisite;
    this._logger = logger;
    this._testName = testName;
    this._runFn = runFn;
    this._itSuccessChecksFn = itSuccessChecksFn;
    this._validationSpec = validationSpec;
    this._initialState = initialState || {};
    /** @type {FlowStageOutput} */
    this._output = {
      result: {
        status: 'no-response-yet',
      },
    };
  }

  run = pMemoize(async () => {
    if (this._preRequisite) {
      await this._preRequisite.run();
    }
    const output = await this._runFn();
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

  successChecks() {
    this._itSuccessChecksFn();
    return this;
  }

  validationTests() {
    sharedValidationTests.shouldBeValidResponse(
      () => (
        'response' in this._output.result
          ? this._output.result.response
          : null // If there is no response, we'll just give validator a null, which it will fail
      ),
      this._validationSpec.name,
      this._logger,
      {
        validationMode: this._validationSpec.validationMode,
      },
      this._validationSpec.opportunityCriteria || undefined,
    );
    return this;
  }

//  getDerivedState = memoize(() => {
//    merge(
//      this._output.state,
//      this._runAfter.getDerivedState(),
//    );
//  })
}

module.exports = {
  FlowStage,
};
