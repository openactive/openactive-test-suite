const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldBeImplementedIfOtherFeaturesAre(module, {
  testCategory: 'core',
  testFeature: 'multiple-sellers',
  testFeatureImplemented: false,
  testIdentifier: 'single-seller-implemented',
  testName: 'Single Seller feature must be implemented if Multiple Sellers is not implemented',
  testDescription: 'Either one, and only one, of the Multiple Sellers feature and the Single Seller feature must be implemented',
  otherFeaturesWhichAreMutuallyExclusiveWithThisOne: [
    'single-seller',
  ],
});
