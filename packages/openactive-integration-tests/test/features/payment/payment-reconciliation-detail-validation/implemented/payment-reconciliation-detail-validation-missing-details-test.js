const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-missing-details',
  testName: 'Payment reconciliation detail validation - missing reconciliation details, when payment required',
  testDescription: 'B should return an InvalidPaymentDetailsError due to missing reconciliation data',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
invalidDetailsTest('missingPaymentReconciliationDetails'));
