const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, successTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentRequired';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Required' : null;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Successful booking with payment property',
  testDescription: 'A successful end to end booking with the `payment` property included. If features `prepayment-optional` or `prepayment-unavailable` have been implemented then `openBookingPrepayment` in `totalPaymentDue` should be `https://openactive.io/Required` in this test, otherwise it should not be included in the `totalPaymentDue` (as it is required by default).',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
},
successTests(expectedPrepayment, 'paidWithPayment'));
