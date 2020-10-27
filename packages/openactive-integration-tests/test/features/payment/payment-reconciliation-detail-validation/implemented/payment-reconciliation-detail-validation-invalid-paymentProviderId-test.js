const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-invalid-paymentProviderId',
  testName: 'Payment reconciliation detail validation - invalid paymentProviderId',
  testDescription: 'B should return an InvalidPaymentDetailsError due to invalid requisition data',
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
invalidDetailsTest('invalidPaymentProviderId'));
