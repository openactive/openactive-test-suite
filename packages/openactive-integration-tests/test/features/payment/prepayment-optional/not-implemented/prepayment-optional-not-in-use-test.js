const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-optional',
  testFeatureImplemented: false,
  testIdentifier: 'prepayment-optional-not-in-use',
  testName: 'The `prepayment` property must not contain the value https://openactive.io/Optional',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableNonFreePrepaymentOptional',
  ],
});
