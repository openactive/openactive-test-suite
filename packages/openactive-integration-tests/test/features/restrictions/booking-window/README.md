[< Return to Overview](../../README.md)
# validFromBeforeStartDate booking window (booking-window)

Duration of window before an opportunity where it is bookable


https://www.openactive.io/open-booking-api/EditorsDraft/#definition-of-a-bookable-opportunity-and-offer-pair

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableWithinValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableWithinValidFromBeforeStartDate) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2, [TestOpportunityBookableOutsideValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate) x3


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/restrictions/booking-window/
```



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
| [opportunity-outside-range-c1-c2](./implemented/opportunity-outside-range-c1-c2-test.js) | Running C1 and C2 for opportunity outside range should fail | Booking an opportunity outside the specified booking window | [TestOpportunityBookableOutsideValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


