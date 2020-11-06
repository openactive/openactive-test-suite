const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { netTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-net',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-business-tax-calculation-net',
  testName: 'Business-to-business tax calculation (net)',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
netTest());
