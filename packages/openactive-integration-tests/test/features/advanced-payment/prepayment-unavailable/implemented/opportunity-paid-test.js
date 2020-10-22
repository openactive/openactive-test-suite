const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplate, successTests } = require('../../prepayment-common');

const testOpportunityCriteria = 'TestOpportunityBookablePaidPrepaymentUnavailable';
const expectedPrepayment = 'https://openactive.io/Unavailable';

FeatureHelper.describeFeature(module, {
  testCategory: 'advanced-payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Opportunity paid',
  testDescription: 'Opportunity paid, prepayment unavailable',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplate(testOpportunityCriteria),
},
successTests(expectedPrepayment));
