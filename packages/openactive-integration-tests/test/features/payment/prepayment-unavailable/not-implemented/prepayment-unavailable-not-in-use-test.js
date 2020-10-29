const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: false,
  testIdentifier: 'prepayment-unavailable-not-in-use',
  testName: 'The `prepayment` property must not contain the value https://openactive.io/Unavailable',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookablePaidPrepaymentUnavailable',
  ],
});
