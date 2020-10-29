const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { errorTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentUnavailable';
const controlOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToUnnecessaryPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-unnecessary-payment-error',
  testName: 'Opportunity paid (unnecessary payment error)',
  testDescription: 'Opportunity paid, prepayment unavailable, unnecessary payment (error)',
  testOpportunityCriteria,
  controlOpportunityCriteria,
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
