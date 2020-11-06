const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { grossTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-gross',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-business-tax-calculation-gross',
  testName: 'Business-to-business tax calculation (gross)',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxGross',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
grossTest({ c2ReqTemplateRef: 'businessCustomer', bReqTemplateRef: 'businessCustomer' }));
