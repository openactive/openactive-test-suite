const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria, successTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentOptional';
const expectedPrepayment = 'https://openactive.io/Optional';
const bReqTemplateRef = 'paidWithPayment';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-optional',
  testFeatureImplemented: true,
  testIdentifier: 'with-payment',
  testName: 'Prepayment optional, with payment supplied, is successful',
  testDescription: 'Opportunity paid, prepayment optional',
  testOpportunityCriteria,
  controlOpportunityCriteria: 'TestOpportunityBookable',
  // temporarily disable control in multiple mode until refactoring complete
  multipleOpportunityCriteriaTemplate: multipleOpportunityCriteriaTemplateWhichOnlyIncludesOneCriteria(testOpportunityCriteria),
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/125
},
successTests(expectedPrepayment, bReqTemplateRef));
