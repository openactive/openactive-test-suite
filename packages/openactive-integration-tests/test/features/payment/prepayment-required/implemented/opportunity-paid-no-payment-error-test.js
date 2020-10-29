const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, errorTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentRequired';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Required' : null;
const expectedError = 'MissingPaymentDetailsError';
const bReqTemplateRef = 'noPayment';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-no-payment-error',
  testName: 'Unsuccessful booking without payment property',
  testDescription: 'An unsuccessful end to end booking for a non-free opportunity, failing due to missing `payment` property.',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
