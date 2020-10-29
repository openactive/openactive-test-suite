const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { successTests } = require('../../common');

const testOpportunityCriteria = 'TestOpportunityBookableNonFreePrepaymentUnavailable';
const controlOpportunityCriteria = 'TestOpportunityBookableFree';
const expectedPrepayment = 'https://openactive.io/Unavailable';
const bReqTemplateRef = 'noPayment';

FeatureHelper.describeFeature(module, {
  testCategory: 'payment',
  testFeature: 'prepayment-unavailable',
  testFeatureImplemented: true,
  testIdentifier: 'opportunity-paid',
  testName: 'Opportunity paid',
  testDescription: 'Opportunity paid, prepayment unavailable',
  testOpportunityCriteria,
  controlOpportunityCriteria,
},
successTests(expectedPrepayment, bReqTemplateRef));
