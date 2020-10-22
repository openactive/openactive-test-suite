[< Return to Overview](../../README.md)
# prepayment not required (prepayment-unavailable)

Support for booking without payment (reservation only)


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnavailable) x2, [TestOpportunityBookablePaidPrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnavailable) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-unavailable": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-free](./implemented/opportunity-free-test.js) | Opportunity free | Opportunity free, prepayment unavailable | [TestOpportunityBookableFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableFreePrepaymentUnavailable) x2 |
| [opportunity-paid-no-payment-error](./implemented/opportunity-paid-no-payment-error-test.js) | Opportunity paid (no payment error) | Opportunity paid, prepayment unavailable, no payment (error) | [TestOpportunityBookablePaidPrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnavailable) x2 |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Opportunity paid | Opportunity paid, prepayment unavailable | [TestOpportunityBookablePaidPrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookablePaidPrepaymentUnavailable) x2 |


