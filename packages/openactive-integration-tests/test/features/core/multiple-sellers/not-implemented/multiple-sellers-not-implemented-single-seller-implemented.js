const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldNotBeImplementedIfOtherFeatureIs(module, {
  testCategory: 'core',
  testFeature: 'multiple-sellers',
  testFeatureImplemented: false,
  testIdentifier: 'multiple-sellers-not-implemented-single-seller-implemented',
  testName: "'single-seller' feature must be implemented if 'multiple-sellers' feature is not",
  otherFeatureWhichImplyThisFeatureShouldNotBeImplemented: 'single-seller',
  configNeededForOtherFeature: {
    sellers: {
      primary: true,
      secondary: false,
    }
  }
});