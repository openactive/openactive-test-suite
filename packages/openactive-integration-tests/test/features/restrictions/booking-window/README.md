[< Return to Overview](../../README.md)
# validFromBeforeStartDate booking window (booking-window)

Duration of window before an opportunity where it is bookable


https://www.openactive.io/open-booking-api/EditorsDraft/#definition-of-a-bookable-opportunity-and-offer-pair

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableWithinValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableWithinValidFromBeforeStartDate) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "booking-window": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-in-range-c1-c2](./implemented/opportunity-in-range-c1-c2-test.js) | Running C1 and C2 for opportunity in range should succeed | Booking an opportunity within the specified booking window | [TestOpportunityBookableWithinValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableWithinValidFromBeforeStartDate) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


