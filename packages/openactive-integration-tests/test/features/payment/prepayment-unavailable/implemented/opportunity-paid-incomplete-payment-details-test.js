const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { errorTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentUnavailable';
const controlOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToMissingIdentifierInPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-incomplete-payment-details',
  testName: 'IncompletePaymentDetailsError must be returned in the case that payment details are not supplied',
  testDescription: 'An unsuccessful end to end booking, because identifier is missing in the payment property in B request.',
  testOpportunityCriteria,
  controlOpportunityCriteria,
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
