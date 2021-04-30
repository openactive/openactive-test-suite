[< Return to Overview](../../README.md)
# Business-to-business Tax Calculation (TaxNet) (business-to-business-tax-calculation-net)

Tax calculation when the customer is of type Organization (business-to-business), when the seller has taxMode TaxNet


https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-business-tax-calculation-by-booking-system-is-optional

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreeTaxNet](https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxNet) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/tax/business-to-business-tax-calculation-net/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "business-to-business-tax-calculation-net": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [business-to-business-tax-calculation-net](./implemented/business-to-business-tax-calculation-net-test.js) | Tax calculations | The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price. | [TestOpportunityBookableNonFreeTaxNet](https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxNet) x4 |


