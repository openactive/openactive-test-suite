const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { grossTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-gross',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-business-tax-calculation-gross',
  testName: 'Tax calculations',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxGross',
  // the simple tests can only work if all OrderItems have the same tax mode
  controlOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxGross',
},
grossTest({ c2ReqTemplateRef: 'businessCustomer', bReqTemplateRef: 'businessCustomer' }));
