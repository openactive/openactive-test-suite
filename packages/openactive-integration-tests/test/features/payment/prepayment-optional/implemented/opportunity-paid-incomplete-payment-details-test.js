const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, errorTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentOptional';
const expectedPrepayment = 'https://openactive.io/Optional';
const expectedError = 'IncompletePaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToMissingIdentifierInPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-optional',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-incomplete-payment-details',
  testName: 'IncompletePaymentDetailsError must be returned in the case that payment details are not supplied',
  testDescription: 'An unsuccessful end to end booking, because identifier is missing in the payment property in B request.',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
