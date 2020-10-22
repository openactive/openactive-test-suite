[< Return to Overview](../../README.md)
# prepayment not specified (prepayment-unspecified)

Support for booking without payment (reservation only)


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFreePrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified) x2, [TestOpportunityBookablePaidPrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified) x2

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-unspecified": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-free](./implemented/opportunity-free-test.js) | Opportunity free | Opportunity free, prepayment unspecified | [TestOpportunityBookableFreePrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnspecified) x2 |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Opportunity paid | Opportunity paid, prepayment unspecified | [TestOpportunityBookablePaidPrepaymentUnspecified](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnspecified) x2 |


