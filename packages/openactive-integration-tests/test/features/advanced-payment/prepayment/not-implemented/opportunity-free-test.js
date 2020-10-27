const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../common');

const testOpportunityCriteria = 'TestOpportunityBookableFreePrepaymentUnspecified';
const expectedPrepayment = null;

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment',
  testFeatureImplemented: false,
  testIdentifier: 'opportunity-free',
  testName: 'Opportunity free',
  testDescription: 'Opportunity free, prepayment unspecified',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
