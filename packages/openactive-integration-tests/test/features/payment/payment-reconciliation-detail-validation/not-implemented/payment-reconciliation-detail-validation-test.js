const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { notImplementedTest } = require('../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: false,
  testIdentifier: 'payment-reconciliation-detail-validation',
  testName: 'Payment reconciliation detail validation',
  testDescription: 'C1, C2 and B - including reconciliation details - should succeed, ignoring these values',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
notImplementedTest());
