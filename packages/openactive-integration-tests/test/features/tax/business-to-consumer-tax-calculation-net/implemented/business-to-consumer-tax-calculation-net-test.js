const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { netTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-consumer-tax-calculation-net',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-consumer-tax-calculation-net',
  testName: 'Business-to-consumer tax calculation (net)',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
  // the simple tests can only work if all OrderItems have the same tax mode
  controlOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
},
// The default C2/B request templates use a Person as customer, meaning that we
// don't have to specify template overrides in order to get business-to-consumer
// behaviour.
netTest());
