[< Return to Overview](../../README.md)
# Availability Checking (availability-check)

Runs only C1 and C2, to confirm availability checks work as expected


https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description-0

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-4-c1-and-c2-without-leases)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values can be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x5, [TestOpportunityBookableNoSpaces](https://openactive.io/test-interface#TestOpportunityBookableNoSpaces) x3


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
| [opportunity-full](./implemented/opportunity-full-test.js) | OpportunityIsFullError returned for full OrderItems | An availability check against a session filled to capacity. As no more capacity is available it is no-longer possible to obtain quotes. | [TestOpportunityBookableNoSpaces](https://openactive.io/test-interface#TestOpportunityBookableNoSpaces) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



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
