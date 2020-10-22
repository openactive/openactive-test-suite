const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookableFreePrepaymentUnavailable';
const expectedPrepayment = 'https://openactive.io/Unavailable';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-free',
  testName: 'Opportunity free',
  testDescription: 'Opportunity free, prepayment unavailable',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
