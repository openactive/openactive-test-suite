const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, errorTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookableFreePrepaymentUnavailable';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToUnnecessaryPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free-unnecessary-payment-error',
  testName: 'Opportunity free (unnecessary payment error)',
  testDescription: 'Opportunity free, prepayment unavailable, unnecessary payment (error)',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
