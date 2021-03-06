const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { notImplementedTest } = require('../common');

const { IMPLEMENTED_FEATURES } = global;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: false,
  testIdentifier: 'payment-reconciliation-detail-validation-missing-details',
  testName: 'Payment reconciliation detail validation - missing reconciliation details',
  testDescription: 'C1, C2 and B - with missing reconciliation details - should succeed, ignoring these values',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
  runOnlyIf: IMPLEMENTED_FEATURES['non-free-opportunities'],
},
notImplementedTest({ bookReqTemplateRef: 'missingPaymentReconciliationDetails' }));
