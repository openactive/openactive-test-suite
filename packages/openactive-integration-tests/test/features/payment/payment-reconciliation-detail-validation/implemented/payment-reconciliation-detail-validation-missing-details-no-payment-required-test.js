const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-missing-details-no-payment-required',
  testName: 'Payment reconciliation detail validation - missing reconciliation details, when no payment required',
  testDescription: 'B should return an InvalidPaymentDetailsError due to missing reconciliation data',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
  runOnlyIf: IMPLEMENTED_FEATURES['free-opportunities'],
  supportsApproval: true,
},
invalidDetailsTest('missingPaymentReconciliationDetails'));
