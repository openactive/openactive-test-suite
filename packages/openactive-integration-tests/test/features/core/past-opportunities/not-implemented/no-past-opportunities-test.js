const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'core',
  testFeature: 'past-opportunities',
  testFeatureImplemented: false,
  testIdentifier: 'no-past-opportunities',
  testName: 'The open data feeds must not contain any opportunities with `startDate` in the past',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableInPast',
  ],
});
