const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { paymentReconciliationSuccessTest } = require('../common');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-no-payment-required',
  testName: 'Payment reconciliation detail validation, where payment is not required',
  testDescription: 'C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed',
  testOpportunityCriteria: 'TestOpportunityBookableFree',
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
  runOnlyIf: IMPLEMENTED_FEATURES['free-opportunities'],
  supportsApproval: true,
},
paymentReconciliationSuccessTest(true));
