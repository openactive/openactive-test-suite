const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: false,
  testIdentifier: 'no-free-opportunities',
  testName: 'The open data feeds must not contain any free opportunities',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableFree',
  ],
});
