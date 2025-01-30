const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { errorTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentUnavailable';
const controlOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToUnnecessaryPaymentThoughPaymentIdentifierIsMissing';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid-incomplete-payment-details',
  testName: 'UnnecessaryPaymentDetailsError must be returned when payment property (incomplete or otherwise) is included',
  testDescription: 'When prepayment is unavailable, include an incomplete `payment` object for B. Even though the `payment` object is incomplete, the Booking System should only respond to the fact that `payment` is included when it is unecessary, therefore returning an UnnecessaryPaymentDetailsError',
  testOpportunityCriteria,
  controlOpportunityCriteria,
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
