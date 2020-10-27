const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment',
  testFeatureImplemented: false,
  testIdentifier: 'prepayment-not-in-use',
  testName: 'The `prepayment` property must not be in use',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableFreePrepaymentOptional',
    'TestOpportunityBookablePaidPrepaymentOptional',
    'TestOpportunityBookableFreePrepaymentUnavailable',
    'TestOpportunityBookablePaidPrepaymentUnavailable',
    'TestOpportunityBookableFreePrepaymentRequired',
    'TestOpportunityBookablePaidPrepaymentRequired',
  ],
});
