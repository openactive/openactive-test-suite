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
  testName: 'Successfully book paid Opportunity',
  testDescription: 'Successful booking of a paid Opportunity, where openBookingPrepayment is unavailable, without `payment` property',
  testOpportunityCriteria,
  controlOpportunityCriteria,
  supportsApproval: false, // https://github.com/openactive/OpenActive.Server.NET/issues/125
},
successTests(expectedPrepayment, bReqTemplateRef));
