const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldOnlyBeImplementedIfOtherFeaturesAre(module, {
  testCategory: 'authentication',
  testFeature: 'booking-partner-openid-authentication-for-multiple-sellers',
  testFeatureImplemented: true,
  testIdentifier: 'required-features',
  testName: 'Can only be implemented if other features are',
  requiredFeatures: ['multiple-sellers', 'booking-partner-openid-authentication'],
});
