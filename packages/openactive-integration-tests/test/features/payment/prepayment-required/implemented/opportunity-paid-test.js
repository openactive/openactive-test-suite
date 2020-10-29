const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentRequired';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Required' : null;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Successful booking with payment property',
  testDescription: 'A successful end to end booking with the `payment` property included.',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment, 'standardPaid'));
