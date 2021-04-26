const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: false,
  testIdentifier: 'prepayment-required-not-in-use',
  testName: 'The `openBookingPrepayment` property must not contain the value https://openactive.io/Required, or be unspecified for opportunities with non-zero price',
  unmatchedOpportunityCriteria: [
    'TestOpportunityBookableNonFreePrepaymentRequired',
  ],
});
