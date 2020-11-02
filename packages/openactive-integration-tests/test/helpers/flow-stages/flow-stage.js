const pMemoize = require('p-memoize');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 * @typedef {import('../../types/OpportunityCriteria').OpportunityCriteria} OpportunityCriteria
 * @typedef {import('../../shared-behaviours/validation').ValidationMode} ValidationMode
 * @typedef {import('../../helpers/logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('./opportunity-feed-update').OrderItem} OrderItem
 */

/**
 * @typedef {'https://openactive.io/Required' | 'https://openactive.io/Optional' | 'https://openactive.io/Unavailable'} Prepayment
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
 * @property {string | null | undefined} [orderId] ID of the Order within the Booking
 *   System.
 *   Optional as a Booking System response may not include ID if there was an error.
 * @property {number | null | undefined} [totalPaymentDue] totalPaymentDue.price
 *   from a Booking System Order response.
 *   Optional as a Booking System response may not include totalPaymentDue if there
 *   was an error.
 * @property {Prepayment | null | undefined} [prepayment] totalPaymentDue.prepayment
 *   from a Booking System Order response.
 *   Optional as a Booking System response may not include prepayment if not supported.
 * @property {string | null | undefined} [orderProposalVersion] Optional as a Booking
 *   System response may not include orderProposalVersion if there was an error.
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
   * @param {() => TInput} args.getInput Some FlowStages need input derived from
   *   the output of other FlowStages. e.g. B might need to use the `totalPaymentDue`
   *   derived from C2.
   *   This input goes into `getInput`. It's a function as it will be called when
   *   the FlowStage is run (rather than when the FlowStage is set up). Therefore,
   *   it will have acccess to the output of any prerequisite stages.
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
    this._runFn = runFn;
    this._itSuccessChecksFn = itSuccessChecksFn;
    this._itValidationTestsFn = itValidationTestsFn;
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
      switch (this._state.status) {
        case 'no-response-yet':
          throw new Error(`${this.getLoggableStageName()}.getOutput() failed as the stage has not been run. Has this stage been correctly set up as prerequisite to the stage that uses its output? FlowStage state: ${this._getLoggableStateSummaryForErrorLog()}`);
        case 'prerequisite-run-error':
          throw new Error(`${this.getLoggableStageName()}.getOutput() failed. This is because a prerequisite stage errored when it ran. A failing stage will fail all tests of subsequent stages. FlowStage state: ${this._getLoggableStateSummaryForErrorLog()}`);
        default:
          throw new Error(`${this.getLoggableStageName()}.getOutput() failed as there was an error running this FlowStage. FlowStage state: ${this._getLoggableStateSummaryForErrorLog()}`);
      }
    }
    return this._state.output;
  }

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
}

/**
 * @template {FlowStageOutput} TInput
 * @template {FlowStageOutput} TOutput
 * @typedef {FlowStage<TInput, TOutput>} FlowStageType
 */

module.exports = {
  FlowStage,
};
