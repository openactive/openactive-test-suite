/*

ACTIONS:

1. Move the config to the root of the project.
```
{
  "broker": { ...},
  "integration-tests": { ...},
  "sellers": {
    ...
  }
}
```
2. Test data generator can then use the sellers prop to gen data
3. Tax mode tests will just use tax mode to

[No] hacky version:
in data generator, if the criteria is ...TaxNet, set the seller to the taxNet seller.

[yes] less hacky version: use conflicting-seller's approach like this:

```
singleOpportunityCriteriaTemplate: opportunityType => [
  {
    opportunityType,
    opportunityCriteria: 'TestOpportunityBookable',
    seller: getSellerFromTaxMode('../TaxNet'),
  },
],
```

*/
const { FeatureHelper } = require('../../../../helpers/feature-helper');
const { netTest } = require('../../common');

FeatureHelper.describeFeature(module, {
  testCategory: 'tax',
  testFeature: 'business-to-business-tax-calculation-net',
  testFeatureImplemented: true,
  testIdentifier: 'business-to-business-tax-calculation-net',
  testName: 'Tax calculations',
  testDescription: 'The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price.',
  testOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
  // the simple tests can only work if all OrderItems have the same tax mode
  controlOpportunityCriteria: 'TestOpportunityBookableNonFreeTaxNet',
  supportsApproval: true,
  skipBookingFlows: ['OpenBookingSimpleFlow'],
  skipMultiple: true,
  skipOpportunityTypes: ['FacilityUseSlot']
},
netTest({ c2ReqTemplateRef: 'businessCustomer', bookReqTemplateRef: 'businessCustomer' }));
