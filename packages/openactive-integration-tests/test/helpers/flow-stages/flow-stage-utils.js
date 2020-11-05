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
 * @typedef {import('../sellers').SellerConfig} SellerConfig
 */

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
   * @param {SellerConfig} [args.sellerConfig]
   */
  createDefaultFlowStageParams({ requestHelper, logger, uuid, sellerConfig }) {
    return {
      requestHelper,
      logger,
      uuid: uuid || generateUuid(),
      sellerConfig: sellerConfig || /** @type {SellerConfig} */(SELLER_CONFIG.primary),
      // sellerId: sellerId || /** @type {string} */(SELLER_CONFIG.primary['@id']),
    };
  },

  /**
   * Creates a `describe(..)` block in which:
   *
   * 1. Runs the flow stage in a `beforeAll(..)` block.
   * 2. (Depending on the value of `checks`) Runs success checks and validation checks of the response in `it(..)` blocks.
   * 3. Optionally runs extra tests.
   *
   * @param {object} checks
   * @param {boolean} checks.doCheckSuccess If true, success checks will be run
   * @param {boolean} checks.doCheckIsValid If true, validation will be run
   * @param {UnknownFlowStageType} flowStage
   * @param {() => void} [itAdditionalTests] Additional tests which will
   *   be run after success and validation tests have run.
   *   These tests need to create `it(..)` blocks for each of the new tests.
   *   The tests will be run within the same `describe(..)` block as
   *   success/validation tests.
   */
  describeRunAndRunChecks(checks, flowStage, itAdditionalTests) {
    if (!flowStage.shouldDescribeFlowStage) {
      throw new Error(`describeRunAndCheckIsSuccessfulAndValid(..) cannot run on ${flowStage.getLoggableStageName()} as shouldDescribeFlowStage is false`);
    }
    describe(flowStage.testName, () => {
      flowStage.beforeSetup();

      if (checks.doCheckSuccess) {
        flowStage.itSuccessChecks();
      }
      if (checks.doCheckIsValid) {
        flowStage.itValidationTests();
      }

      if (itAdditionalTests) {
        itAdditionalTests();
      }
    });
  },

  /**
   * Creates a `describe(..)` block in which:
   *
   * 1. Runs the flow stage in a `beforeAll(..)` block.
   * 2. Runs success checks and validation checks of the response in `it(..)` blocks.
   * 3. Optionally runs extra tests.
   *
   * @param {UnknownFlowStageType} flowStage
   * @param {() => void} [itAdditionalTests] Additional tests which will
   *   be run after success and validation tests have run.
   *   These tests need to create `it(..)` blocks for each of the new tests.
   *   The tests will be run within the same `describe(..)` block as
   *   success/validation tests.
   */
  describeRunAndCheckIsSuccessfulAndValid(flowStage, itAdditionalTests) {
    return FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: true, doCheckSuccess: true }, flowStage, itAdditionalTests);
  },

  /**
   * Use for a FlowStage which is expected to return a (valid) error response.
   *
   * Creates a `describe(..)` block in which:
   *
   * 1. Runs the flow stage in a `beforeAll(..)` block.
   * 2. Runs validation checks of the response in `it(..)` blocks.
   *   NOTE: Success checks are not run
   * 3. Optionally runs extra tests.
   *
   * @param {UnknownFlowStageType} flowStage
   * @param {() => void} [itAdditionalTests] Additional tests which will
   *   be run after success and validation tests have run.
   *   These tests need to create `it(..)` blocks for each of the new tests.
   *   The tests will be run within the same `describe(..)` block as
   *   success/validation tests.
   */
  describeRunAndCheckIsValid(flowStage, itAdditionalTests) {
    return FlowStageUtils.describeRunAndRunChecks({ doCheckIsValid: true, doCheckSuccess: false }, flowStage, itAdditionalTests);
  },
};

module.exports = {
  FlowStageUtils,
};
