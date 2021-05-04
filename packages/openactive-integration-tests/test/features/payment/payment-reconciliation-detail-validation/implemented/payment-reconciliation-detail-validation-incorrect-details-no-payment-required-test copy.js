const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-incorrect-details-no-payment-required',
  testName: 'Payment reconciliation detail validation - incorrect reconciliation details, when no payment required',
  testDescription: 'B should return an InvalidPaymentDetailsError due to incorrect reconciliation data',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
  runOnlyIf: IMPLEMENTED_FEATURES['free-opportunities'],
  supportsApproval: true, // https://github.com/openactive/OpenActive.Server.NET/issues/126
},
invalidDetailsTest('incorrectReconciliationDetails'));
