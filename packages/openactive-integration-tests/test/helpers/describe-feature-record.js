const _ = require('lodash');

/** TODO2 */
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
