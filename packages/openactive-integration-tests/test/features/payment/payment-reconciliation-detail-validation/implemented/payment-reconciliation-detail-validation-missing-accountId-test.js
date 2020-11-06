const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { invalidDetailsTest } = require('../common');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'payment-reconciliation-detail-validation',
  testFeatureImplemented: true,
  testIdentifier: 'payment-reconciliation-detail-validation-missing-accountId',
  testName: 'Payment reconciliation detail validation - missing accountId',
  testDescription: 'B should return an InvalidPaymentDetailsError due to missing requisition data',
  testOpportunityCriteria: 'TestOpportunityBookableUsingPayment',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
invalidDetailsTest('noAccountId'));
