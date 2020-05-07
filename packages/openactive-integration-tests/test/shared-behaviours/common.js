/* eslint-disable no-unused-vars */
const chakram = require('chakram');
const { FeatureHelper } = require('../helpers/feature-helper');

const { expect } = chakram;
/* eslint-enable no-unused-vars */

class Common {

  static describeRequiredFeature (configuration) {
    FeatureHelper.describeFeature(Object.assign({
      testDescription: 'This feature is required by the specification and must be implemented.',
    }, configuration),
    // eslint-disable-next-line no-unused-vars
    function (_configuration, _orderItemCriteria, _featureIsImplemented, _logger, state, _flow) {
      describe('Feature', function () {
        it('must be implemented', () => {
          // eslint-disable-next-line no-unused-expressions
          expect.fail('This feature is required by the specification, and so cannot be set to "not-implemented".');
        });
      });
    });    
  }

}

module.exports = {
  Common
};
