const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldBeImplementedIfOtherFeaturesAreOrAreNot(module, {
  testCategory: 'core',
  testFeature: 'single-seller',
  testFeatureImplemented: false,
  testIdentifier: 'multiple-sellers-implemented',
  testName: 'Multiple Sellers feature must be implemented if Single Seller is not implemented',
  testDescription: 'Either one, and only one, of the Multiple Sellers feature and Single Seller feature must be implemented',
  otherFeaturesWhichAreMutuallyExclusiveWithThisOne: [
    'multiple-sellers',
  ],
});
