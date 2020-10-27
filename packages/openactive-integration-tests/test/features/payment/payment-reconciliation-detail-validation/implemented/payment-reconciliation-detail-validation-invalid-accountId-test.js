const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-invalid-accountId',
  testName: 'Payment reconciliation detail validation - invalid accountId',
  testDescription: 'B should return an InvalidPaymentDetailsError due to invalid reconciliation data',
  testOpportunityCriteria: 'TestOpportunityBookablePaid',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
invalidDetailsTest('invalidAccountId'));
