const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, errorTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentOptional';
const expectedPrepayment = 'https://openactive.io/Optional';
const expectedError = 'TotalPaymentDueMismatchError';
const bReqTemplateRef = 'incorrectTotalPaymentDuePrice';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-optional',
  testFeatureImplemented: true,
  testIdentifier: 'payment-mismatch',
  testName: 'Expect a TotalPaymentDueMismatchError when the totalPaymentDue property does not match',
  testDescription: 'Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue)',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
},
errorTests(expectedPrepayment, expectedError, bReqTemplateRef));
