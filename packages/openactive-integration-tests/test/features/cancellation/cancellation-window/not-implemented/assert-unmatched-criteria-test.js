const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'cancellation-window',
  testFeatureImplemented: false,
  testIdentifier: 'assert-unmatched-within-window-criteria',
  testName: 'Opportunities relevant to this not-implemented feature must not be available in opportunity feeds',
  unmatchedOpportunityCriteria: ['TestOpportunityBookableCancellableWithinWindow', 'TestOpportunityBookableCancellableOutsideWindow'],
});
