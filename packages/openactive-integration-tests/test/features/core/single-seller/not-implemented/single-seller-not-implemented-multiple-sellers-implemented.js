const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldNotBeImplementedIfOtherFeatureIs(module, {
  testCategory: 'core',
  testFeature: 'single-seller',
  testFeatureImplemented: false,
  testIdentifier: 'single-seller-not-implemented-multiple-sellers-implemented',
  testName: "'multiple-sellers' feature must be implemented if 'single-seller' feature is not",
  otherFeatureWhichImplyThisFeatureShouldNotBeImplemented: 'multiple-sellers',
  configNeededForOtherFeature: {
    sellers: {
      primary: true,
    }
  }
});