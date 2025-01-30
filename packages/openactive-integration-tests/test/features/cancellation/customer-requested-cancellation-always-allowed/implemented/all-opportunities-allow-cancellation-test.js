const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'cancellation',
  testFeature: 'customer-requested-cancellation-always-allowed',
  testFeatureImplemented: true,
  testIdentifier: 'all-opportunities-allow-cancellation',
  testName: 'All opportunities in the feeds allow cancellation',
  testDescription: 'Check that the feed does not include any bookable sessions that have cancellation restricted.',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableNotCancellable',
  ],
});
