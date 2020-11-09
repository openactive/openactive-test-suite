[< Return to Overview](../../README.md)
# Business-to-business Tax Calculation (TaxGross) (business-to-business-tax-calculation-gross)

Tax calculation when the customer is of type Organization (business-to-business), when the seller has taxMode TaxGross


https://www.openactive.io/open-booking-api/EditorsDraft/#business-to-business-tax-calculation-by-booking-system-is-optional

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreeTaxGross](https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxGross) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "business-to-business-tax-calculation-gross": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [business-to-business-tax-calculation-gross](./implemented/business-to-business-tax-calculation-gross-test.js) | Tax calculations | The totals of totalPaymentTax should match the sum of the unitTaxSpecification, and the totalPaymentDue.price should equal the total of all acceptedOffer.price PLUS TotalPaymentTax.price. | [TestOpportunityBookableNonFreeTaxGross](https://openactive.io/test-interface#TestOpportunityBookableNonFreeTaxGross) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


