const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-incorrect-details',
  testName: 'Payment reconciliation detail validation - incorrect reconciliation details',
  testDescription: 'B should return an InvalidPaymentDetailsError due to incorrect reconciliation data',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/126
},
invalidDetailsTest('incorrectReconciliationDetails'));
