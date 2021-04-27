const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, errorTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentRequired';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Required' : null;
const expectedError = 'IncompletePaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToMissingIdentifierInPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-incomplete-payment-details',
  testName: 'IncompletePaymentDetailsError must be returned in the case that payment details are not supplied',
  testDescription: 'An unsuccessful end to end booking, because identifier is missing in the payment property in B request.',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
  supportsApproval: true,
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
