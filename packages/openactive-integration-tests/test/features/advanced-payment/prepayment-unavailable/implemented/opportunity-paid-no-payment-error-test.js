const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, errorTests } = require('../../prepayment/common');

const testOpportunityCriteria = 'TestOpportunityBookablePaidPrepaymentUnavailable';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const expectedError = 'MissingPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToMissingPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-no-payment-error',
  testName: 'Opportunity paid (no payment error)',
  testDescription: 'Opportunity paid, prepayment unavailable, no payment (error)',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
