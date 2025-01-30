const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeFeatureShouldBeImplementedIfFlowIsImplemented(module, {
  testCategory: 'approval',
  testFeature: 'minimal-proposal',
  testFeatureImplemented: false,
  testIdentifier: 'minimal-proposal-required-by-flow',
  testName: "'minimal-proposal' feature and 'OpenBookingApprovalFlow' flow are either both `true` or both `false`",
  flowsThatImplyThisFeature: [
    'OpenBookingApprovalFlow',
  ],
});
