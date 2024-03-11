const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldBeImplementedIfOtherFeaturesAre(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required-unavailable',
  testFeatureImplemented: false,
  testIdentifier: 'prepayment-required-unavailable-not-in-use',
  testName: 'Must be implemented if other features are',
  otherFeaturesWhichImplyThisOne: [
    'prepayment-required',
    'prepayment-unavailable',
  ],
});
