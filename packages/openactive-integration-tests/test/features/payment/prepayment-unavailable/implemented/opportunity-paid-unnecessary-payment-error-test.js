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
  testName: 'Fail on unnecessary payment property',
  testDescription: 'For a paid Opportunity, where openBookingPrepayment is unavailable, attempt to book with an extraneous `payment` property. Booking should fail with UnnecessaryPaymentDetailsError',
  testOpportunityCriteria,
  controlOpportunityCriteria,
  supportsApproval: true,
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
