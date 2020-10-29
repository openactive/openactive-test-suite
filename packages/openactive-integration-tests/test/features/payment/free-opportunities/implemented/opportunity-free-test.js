const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../common');

const { IMPLEMENTED_FEATURES } = global;

const testOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = (IMPLEMENTED_FEATURES['prepayment-optional'] || IMPLEMENTED_FEATURES['prepayment-unavailable']) ? 'https://openactive.io/Unavailable' : null;

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'free-opportunities',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free',
  testName: 'Successful booking without payment property',
  testDescription: 'A successful end to end booking without the `payment` property included.',
  testOpportunityCriteria,
  // This must also be TestOpportunityBookableFree as the payment property is only disallowed if ALL items are free.
  controlOpportunityCriteria: 'TestOpportunityBookableFree',
  // temporarily disable control in multiple mode until refactoring complete (TODO TODO)
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
