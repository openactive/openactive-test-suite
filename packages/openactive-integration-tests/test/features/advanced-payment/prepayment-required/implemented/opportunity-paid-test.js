const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookablePaidPrepaymentRequired';
const expectedPrepayment = 'https://openactive.io/Required';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-required',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Opportunity paid',
  testDescription: 'Opportunity paid, prepayment optional',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
