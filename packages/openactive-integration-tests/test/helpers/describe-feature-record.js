const _ = require('lodash');

/**
 * A record of events that occurred during the execution of a test. In
 * particular, it records usage that relates to how the test is annotated. It
 * can then be checked after the test has run to ensure that the test's
 * annotations match the test's runtime behaviour.
 */
class DescribeFeatureRecord {
  constructor() {
    /**
     * Maps each Test Interface Action type (e.g. 'test:AccessChannelUpdateSimulateAction')
     * to the number of times it was used in a given test.
     *
     * @type {{[actionType: string]: number}}
     */
    this._testInterfaceActionUses = {};
  }

  /**
   * @param {string} actionType
   */
  recordTestInterfaceActionUse(actionType) {
    this._testInterfaceActionUses[actionType] = (this._testInterfaceActionUses[actionType] ?? 0) + 1;
  }

  /**
   * @returns {string[]}
   */
  getUsedTestInterfaceActions() {
    return Object.keys(
      _.pickBy(this._testInterfaceActionUses, numUses => numUses > 0),
    );
  }
}

module.exports = {
  DescribeFeatureRecord,
};
