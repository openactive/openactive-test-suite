const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldBeImplementedIfFlowIsImplemented(module, {
  testCategory: 'approval',
  testFeature: 'minimal-proposal',
  testFeatureImplemented: false,
  testIdentifier: 'feature-required-noop',
  testName: 'Feature must be implemented if a specific flow is implemented',
  flowsThatImplyThisFeature: [
    'OpenBookingApprovalFlow',
  ],
});
