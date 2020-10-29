const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, successTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentOptional';
const expectedPrepayment = 'https://openactive.io/Optional';
const bReqTemplateRef = 'noPayment';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-optional',
  testFeatureImplemented: true,
  testIdentifier: 'without-payment',
  testName: 'Prepayment optional, without payment supplied, is successful',
  testDescription: 'Opportunity paid, prepayment optional, no payment (error)',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
},
successTests(expectedPrepayment, bReqTemplateRef));
