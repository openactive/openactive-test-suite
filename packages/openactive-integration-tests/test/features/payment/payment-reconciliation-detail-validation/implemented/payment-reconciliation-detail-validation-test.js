const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { paymentReconciliationSuccessTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation',
  testName: 'Payment reconciliation detail validation, where payment is required',
  testDescription: 'C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  supportsApproval: true,
},
paymentReconciliationSuccessTest(false));
