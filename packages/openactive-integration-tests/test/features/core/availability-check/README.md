[< Return to Overview](../../README.md)
# Availability Checking (availability-check)

Runs only C1 and C2, to confirm availability checks work as expected

https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description-0

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values can be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x6

### Running tests for only this feature

```bash
npm test --runInBand -- test/features/core/availability-check/
```


## 'Implemented' tests

Update `test.json` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "availability-check": true,
  ...
}
```

Note this feature is required by the Open Booking API specification, and so must always be set to `true`.

| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
| [availability-confirmed](./implemented/availability-confirmed-test.js) | Occupancy in C1 and C2 matches feed | Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [conflicting-seller](./implemented/conflicting-seller-test.js) | SellerMismatchError for inconsistent Sellers of OrderItems | Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2 |


## 'Not Implemented' tests

Update `test.json` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "availability-check": false,
  ...
}
```

Note this feature is required by the Open Booking API specification, and so must always be set to `true`.

| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
