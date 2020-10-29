const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, errorTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Unavailable' : null;
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToUnnecessaryPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-unnecessary-payment-error',
  testName: 'Fail free bookings which include erroneous payment property',
  testDescription: 'C1, C2 and B with payment property: payment property is provided but not expected in the request, so an UnnecessaryPaymentDetailsError must be returned.',
  testOpportunityCriteria,
  // This must also be TestOpportunityBookableFree as the payment property is only disallowed if ALL items are free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
  // temporarily disable control in multiple mode until refactoring complete (TODO TODO)
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
