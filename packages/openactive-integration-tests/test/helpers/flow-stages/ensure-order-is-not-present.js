const chai = require('chai');
const { isResponse2xx } = require('../chakram-response-utils');
const { FlowStage } = require('./flow-stage');

/**
 * @typedef {import('../logger').BaseLoggerType} BaseLoggerType
 * @typedef {import('../request-helper').OrderFeedType} OrderFeedType
 * @typedef {import('../request-helper').RequestHelperType} RequestHelperType
 */

/**
 * @typedef {{}} Input
 * @typedef {Pick<import('./flow-stage').FlowStageOutput, 'isOrderUuidPresent'>} Output
 */

/**
 * @param {object} args
 * @param {OrderFeedType} args.orderFeedType
 * @param {string} args.bookingPartnerIdentifier
 * @param {string} args.uuid
 * @param {RequestHelperType} args.requestHelper
 * @param {number} args.initialWaitSecs
 * @returns {Promise<Output>}
 */
async function runEnsureOrderIsNotPresent({ orderFeedType, bookingPartnerIdentifier, uuid, requestHelper, initialWaitSecs }) {
  await new Promise(resolve => setTimeout(() => { resolve(); }, initialWaitSecs * 1000));
  const response = await requestHelper.getIsOrderUuidPresent(orderFeedType, bookingPartnerIdentifier, uuid);
  const isOrderUuidPresent = isResponse2xx(response) ? response.body : null;
  return { isOrderUuidPresent };
}

/**
 * @extends {FlowStage<Input, Output>}
 */
class EnsureOrderIsNotPresentFlowStage extends FlowStage {
  /**
   * @param {object} args
   * @param {FlowStage<unknown, unknown>} [args.prerequisite]
   * @param {RequestHelperType} args.requestHelper
   * @param {string} args.uuid
   * @param {OrderFeedType} args.orderFeedType
   * @param {string} args.bookingPartnerIdentifier
   * @param {number} args.initialWaitSecs Give Broker some time to check the feeds. Number of seconds to wait before
   *   asking Broker if the UUID is present.
   */
  constructor({ prerequisite, requestHelper, uuid, orderFeedType, bookingPartnerIdentifier, initialWaitSecs }) {
    super({
      prerequisite,
      getInput: () => ({}),
      testName: `Ensure Order (${uuid}) Is Not Present`,
      async runFn() {
        // actually the result does need to go into output so that it can be accessed in checks fn.
        return await runEnsureOrderIsNotPresent({
          orderFeedType,
          bookingPartnerIdentifier,
          uuid,
          requestHelper,
          initialWaitSecs,
        });
      },
      itSuccessChecksFn(flowStage) {
        it('UUID should not be present', () => {
          chai.expect(flowStage.getOutput()).to.have.property('isOrderUuidPresent', false);
        });
      },
      itValidationTestsFn: () => { },
    });
  }
}

/**
 * @typedef {InstanceType<typeof EnsureOrderIsNotPresentFlowStage>} EnsureOrderIsNotPresentFlowStageType
 */

module.exports = {
  EnsureOrderIsNotPresentFlowStage,
};
