const { FeatureHelper } = require('../../../../helpers/feature-helper');

FeatureHelper.describeUnmatchedCriteriaFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-must-not-include-prepayment',
  testName: 'Free opportunities must have either a `openBookingPrepayment` value of Unspecified, or have no `openBookingPrepayment` specified',
  unmatchedOpportunityCriteria: ['TestOpportunityBookableFreePrepaymentOptional', 'TestOpportunityBookableFreePrepaymentRequired'],
});
// TODO3: This check should eventually be moved into the validator
