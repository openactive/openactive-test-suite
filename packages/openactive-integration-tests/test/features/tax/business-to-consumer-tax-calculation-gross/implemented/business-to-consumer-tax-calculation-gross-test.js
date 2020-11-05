const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { grossTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-consumer-tax-calculation-gross',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-consumer-tax-calculation-gross',
  testName: 'Tax calculations',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookablePaidTaxGross',
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
grossTest());
