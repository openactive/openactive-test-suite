const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookablePaidPrepaymentUnspecified';
const expectedPrepayment = 'https://openactive.io/Required';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unspecified',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Opportunity paid',
  testDescription: 'Opportunity paid, prepayment unspecified',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
