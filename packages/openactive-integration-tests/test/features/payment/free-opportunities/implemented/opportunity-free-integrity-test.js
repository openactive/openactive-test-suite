const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-integrity',
  testName: 'Free opportunities must not have a `prepayment` value of either Optional or Required, or not specified',
  unmatchedOpportunityCriteria: ['TestOpportunityBookableFreePrepaymentOptional', 'TestOpportunityBookableFreePrepaymentRequired'],
});
