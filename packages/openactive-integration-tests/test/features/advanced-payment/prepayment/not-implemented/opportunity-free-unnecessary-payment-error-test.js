const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, errorTests } = require('../common');

const testOpportunityCriteria = 'TestOpportunityBookableFreePrepaymentUnspecified';
const expectedPrepayment = null;
const expectedError = 'UnnecessaryPaymentDetailsError';
const bReqTemplateRef = 'incorrectOrderDueToUnnecessaryPaymentProperty';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment',
  testFeatureImplemented: false,
  testIdentifier: 'opportunity-free-unnecessary-payment-error',
  testName: 'Opportunity free (unnecessary payment error)',
  testDescription: 'Opportunity free, prepayment unspecified, unnecessary payment (error)',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
