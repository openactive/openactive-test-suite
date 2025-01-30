const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeRequiredFeature(module, {
  testCategory: 'core',
  testFeature: 'dataset-site',
  testFeatureImplemented: false,
  testIdentifier: 'feature-required-noop',
  testName: 'Feature required',
  doesNotUseOpportunitiesMode: true,
});
