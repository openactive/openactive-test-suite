const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-integrity',
  testName: 'Free opportunities must not have a `prepayment` value of either Optional or Required',
  unmatchedOpportunityCriteria: ['TestOpportunityBookableFreePrepaymentOptional', 'TestOpportunityBookableFreePrepaymentRequired'],
});
