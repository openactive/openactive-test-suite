const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { notImplementedTest } = require('../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: false,
  testIdentifier: 'payment-reconciliation-detail-validation-missing-accountId',
  testName: 'Payment reconciliation detail validation - missing accountId',
  testDescription: 'C1, C2 and B including paymentProviderId and name should succeed, ignoring these values',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
notImplementedTest({ bReqTemplateRef: 'noAccountId' }));
