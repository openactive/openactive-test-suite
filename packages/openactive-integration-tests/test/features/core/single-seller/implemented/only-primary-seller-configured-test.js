const { expect } = require('chai');
const { FeatureHelper } = require('../../../../helpers/feature-helper');

const { SELLER_CONFIG } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'single-seller',
  testFeatureImplemented: true,
  testIdentifier: 'only-primary-seller-configured',
  testName: 'Only the primary seller should be configured',
  testDescription: 'If the single-seller feature is implemented, multiple-sellers is not enabled, and so a secondary seller should not be configured.',
  doesNotUseOpportunitiesMode: true,
}, () => {
  describe('Feature', () => {
    it('should only be implemented if there is only one `primary` seller configured', () => {
      expect(SELLER_CONFIG).to.have.nested.property('primary.@id');
      expect(SELLER_CONFIG).to.not.have.nested.property('secondary.@id');
    });
  });
});
