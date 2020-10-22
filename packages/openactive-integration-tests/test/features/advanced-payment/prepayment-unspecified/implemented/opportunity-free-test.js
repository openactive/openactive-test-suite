const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookableFreePrepaymentUnspecified';
const expectedPrepayment = 'https://openactive.io/Unavailable';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unspecified',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free',
  testName: 'Opportunity free',
  testDescription: 'Opportunity free, prepayment unspecified',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
