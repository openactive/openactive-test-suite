// const { get, isNil, memoize } = require('lodash');
const pMemoize = require('p-memoize');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../../shared-behaviours/validation').ValidationMode} ValidationMode
 * @typedef {import('../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 */

/**
 * @typedef {object} FlowStageOutput State which may be outputted by a FlowStage
 * @property {ChakramResponse} [httpResponse] HTTP response, produced by some stages.
 *   e.g. C2 would return an httpResponse with the response from calling C2.
 * @property {string} [sellerId] Seller ID
 * @property {string} [uuid] UUID used for Order
 * @property {OpportunityCriteria[]} [orderItemCriteriaList]
 * @property {ChakramResponse[]} [testInterfaceOpportunities] Opportunity
 *   references for opportunities used by this flow. These match the response
 *   schema for the POST /test-interface/datasets/:testDatasetIdentifier/opportunities
 *   (https://openactive.io/test-interface/#post-test-interfacedatasetstestdatasetidentifieropportunities)
 *   endpoint.
 * @property {ChakramResponse[]} [opportunityFeedExtractResponses]
 * @property {OrderItem[]} [orderItems]
 * @property {ChakramResponse} [bookingSystemOrder] Order as found in the Booking
 *   System. Could contain the response from C1, C2, B, etc.
 * @property {number | null | undefined} [totalPaymentDue] Optional as a Booking System
 *   response may not include totalPaymentDue if there was an error.
 * @property {string | null | undefined} [orderProposalVersion] Optional as a Booking
 *   System response may not include totalPaymentDue if there was an error.
 * @property {Promise<ChakramResponse>} [getOrderFromOrderFeedPromise] Used for
 *   Order Feed updates.
 *
 *   Because an Order Feed update check must be initiated before another stage and then
 *   collected after that stage has completed (e.g. initiate before a cancellation stage
 *   and then collect the result after), this promise is persisted, so that the
 *   result can be collected by resolving it.
 *
 *   The response will be for an RPDE item with { kind, id, state, data, ...etc }.
 */
/**
 * @template {FlowStageOutput} TOutput
 * @typedef {{
 *   status: 'no-response-yet'
 * } | {
 *   status: 'prerequisite-run-error',
 *   error?: unknown,
 * } | {
 *   status: 'run-error',
 *   error?: unknown,
 * } | {
 *   status: 'response-received',
 *   output: TOutput,
 * }} FlowStageState
 */
// /**
//  * @template TOutput
//  * @typedef {{
//  *   result: FlowStageResult<TFlowStageResponse>,
//  *   state?: FlowStageState,
//  * }} FlowStageOutput
//  */

//  * @template TInputState
//  * @param {TInputState} [args.inputState]
//  * @param {(flowStage: FlowStage<TFlowStageResponse>) => Promise<FlowStageOutput<TFlowStageResponse>>} args.runFn
//  * @param {FlowStageOutput<TFlowStageResponse>['state']} [args.initialState] Set some initial
//  *   values for state e.g. use a pre-determined UUID.
//  * @param {(getOutput: () => TOutput) => void} args.itSuccessChecksFn
//  * @param {(getOutput: () => TOutput) => void} args.itValidationTestsFn
/**
 * A "stage" of a particular booking flow. For example, a flow might have
 * a stage for each of the following:
 *
 * - FetchOpportunities
 * - C1
 * - C2
 * - B
 *
 * @template {FlowStageOutput} TInput
 * @template {FlowStageOutput} TOutput
 */
class FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown, unknown>} [args.prerequisite] Stage that must be completed before
   *   this stage is run. e.g. a C2 stage might have a C1 stage as its
   *   pre-requisite.
   * @param {() => TInput} args.getInput TODO TODO document
   * @param {string} args.testName
   * @param {(input: TInput) => Promise<TOutput>} args.runFn
   * @param {(flowStage: FlowStage<unknown, TOutput>) => void} args.itSuccessChecksFn
   * @param {(flowStage: FlowStage<unknown, TOutput>) => void} args.itValidationTestsFn
   * @param {boolean} [args.shouldDescribeFlowStage] If false, this FlowStage should
   *   not get its own `describe(..)` block. Use this for abstract flow stages like
   *   an Order Feed Update initiator.
   *
   *   Defaults to true.
   */
  constructor({ prerequisite, getInput, testName, runFn, itSuccessChecksFn, itValidationTestsFn, shouldDescribeFlowStage = true }) {
    this.testName = testName;
    this.shouldDescribeFlowStage = shouldDescribeFlowStage;
    this._prerequisite = prerequisite;
    this._getInput = getInput;
    // this._inputState = inputState || f(this._prerequisite.getOutput());
    this._runFn = runFn;
    this._itSuccessChecksFn = itSuccessChecksFn;
    this._itValidationTestsFn = itValidationTestsFn;
    // this._initialState = initialState || {};
    /** @type {FlowStageState<TOutput>} */
    this._state = {
      status: 'no-response-yet',
    };
  }

  /**
   * Looks like `FlowStage(testName: C1)`
   */
  getLoggableStageName() {
    return `FlowStage(testName: ${this.testName})`;
  }

  /**
   * Get a short summary of this FlowStage's result that can be included in an error
   * log.
   * This is intended to be logged if some pre-condition has failed e.g. if getCombinedStateAfterRun()
   * is called before `.run()` has been called or after `.run()` has failed.
   */
  _getLoggableStateSummaryForErrorLog() {
    if ('error' in this._state && (this._state.error instanceof Error)) {
      // Get error data from Error object in a format that can be JSON stringified.
      // Errors, in JS, do not get JSON stringified.
      const error = {
        name: this._state.error.name,
        message: this._state.error.message,
        ...this._state.error,
        // We exclude `.stack` because we're just outputting a summary of the result.
        // This summary may get printed several times over if a prerequisite stage
        // fails before many other stages.
        // The full error should have been reported as soon as it occurred.
      };
      return JSON.stringify({ ...this._state, error });
    }
    return JSON.stringify(this._state);
  }

  /**
   * Note: This will throw an error if there is no response yet.
   */
  getOutput() {
    if (!('output' in this._state)) {
      throw new Error(`${this.getLoggableStageName()}.getOutput() called but there is no response. FlowStage state: ${this._getLoggableStateSummaryForErrorLog()}`);
    }
    return this._state.output;
  }

  // /**
  //  * Note: This will throw an error if there is no response yet.
  //  */
  // getResponse() {
  //   if (!('response' in this._state.result)) {
  //     throw new Error(`${this.getLoggableStageName()}.getResponse() called but there is no response. FlowStage result: ${this._getLoggableResultSummaryForErrorLog()}`);
  //   }
  //   return this._state.result.response;
  // }

  /**
   * Run this FlowStage. The result can then be retrieved using `getResponse()`
   * or `getCombinedStateAfterRun()`.
   *
   * If there is a prerequisite stage, it will be run first.
   *
   * The result is cached.
   */
  run = pMemoize(async () => {
    // ## 1. Run prerequisite stage
    //
    // (if it hasn't already been run)
    if (this._prerequisite) {
      try {
        await this._prerequisite.run();
      } catch (error) {
        this._state = {
          status: 'prerequisite-run-error',
          error,
        };
        throw error;
      }
    }
    // ## 2. Run this stage
    const input = this._getInput();
    let output;
    try {
      output = await this._runFn(input);
    } catch (error) {
      this._state = {
        status: 'run-error',
        error,
      };
      throw error;
    }
    // ## 3. Save result
    this._state = {
      status: 'response-received',
      output,
    };
  }, { cachePromiseRejection: true });

  beforeSetup() {
    beforeAll(async () => {
      await this.run();
    });
    return this;
  }

  /**
   * Check that the response received at this stage was successful.
   *
   * Creates it() blocks.
   */
  itSuccessChecks() {
    // this._itSuccessChecksFn(this);
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
  }

  // /**
  //  * Get the combined state from all prerequisite stages.
  //  *
  //  * This is memoized so that the merge only needs to be computed once.
  //  *
  //  * Therefore, this function throws if the prerequisite stages have not
  //  * actually been run. Rationale:
  //  *
  //  * - Asking for the prerequisite state before these stages have been run implies
  //  *   that something has gone wrong in setting up the tests to run one after the
  //  *   other.
  //  * - Since this function is memoized, we only want to cache when there is a useful
  //  *   result to cache.
  //  *
  //  * @type {() => FlowStageState}
  //  */
  // getPrerequisiteCombinedState = memoize(() => {
  //   const initialState = this._initialState || {};
  //   if (this._prerequisite) {
  //     return {
  //       ...this._prerequisite.getCombinedStateAfterRun(),
  //       ...initialState,
  //     };
  //   }
  //   return initialState;
  // })

  // /**
  //  * Get the combined state from all prerequisite stages.
  //  * Assert if this state is missing any of the fields that it is expected to have.
  //  *
  //  * @param {(keyof FlowStageState)[]} expectedFields Fields of the prerequisite
  //  *   combined state that must have values.
  //  */
  // getPrerequisiteCombinedStateAssertFields(expectedFields) {
  //   const prerequisiteCombinedState = this.getPrerequisiteCombinedState();
  //   for (const expectedField of expectedFields) {
  //     if (isNil(prerequisiteCombinedState[expectedField])) {
  //       throw new Error(`${this.getLoggableStageName()}.getPrerequisiteCombinedStateAssertFields(): Expected "${expectedField}" to be in prerequisiteCombinedState, but it was not. prerequisiteCombinedState fields: ${JSON.stringify(Object.keys(prerequisiteCombinedState))}`);
  //     }
  //   }
  //   return prerequisiteCombinedState;
  // }

  // /**
  //  * Get totalPaymentDue from getPrerequisiteCombinedState().bookingSystemOrder.
  //  *
  //  * Throws if totalPaymentDue is not present.
  //  *
  //  * @returns {number}
  //  */
  // getAndAssertTotalPaymentDueFromPrerequisiteCombinedState() {
  //   const { bookingSystemOrder } = this.getPrerequisiteCombinedStateAssertFields(['bookingSystemOrder']);
  //   const totalPaymentDue = get(bookingSystemOrder, ['body', 'totalPaymentDue', 'price']);
  //   if (isNil(totalPaymentDue)) {
  //     throw new Error(`${this.getLoggableStageName()}.getAndAssertTotalPaymentDueFromPrerequisiteCombinedState(): Expected bookingSystemOrder to have a totalPaymentDue.price but it does not`);
  //   }
  //   return totalPaymentDue;
  // }

  // /**
  //  * Get the combined state from this stage and all prerequisite stages.
  //  *
  //  * This is memoized so that the merge only needs to be computed once.
  //  *
  //  * Therefore, this function throws if this stage or prerequisite stages have
  //  * not been run. Rationale:
  //  *
  //  * - Asking for the "afterRun" state before this stages has been run implies
  //  *   that something has gone wrong in setting up the tests to run one after the
  //  *   other.
  //  * - Since this function is memoized, we only want to cache when there is a useful
  //  *   result to cache.
  //  *
  //  * @type {() => FlowStageState}
  //  */
  // getCombinedStateAfterRun = memoize((() => {
  //   if (this._state.result.status !== 'response-received') {
  //     throw new Error(`${this.getLoggableStageName()}.getCombinedStateAfterRun() called but this stage has not received a response. FlowStage result: ${this._getLoggableStateSummaryForErrorLog()}`);
  //   }
  //   return {
  //     ...this.getPrerequisiteCombinedState(),
  //     ...this._state.state || {},
  //   };
  // }))
}

/**
 * @template {FlowStageOutput} TInput
 * @template {FlowStageOutput} TOutput
 * @typedef {FlowStage<TInput, TOutput>} FlowStageType
 */

module.exports = {
  FlowStage,
};
