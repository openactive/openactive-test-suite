[< Return to Overview](../../README.md)
# Opportunities with a non-zero price (non-free-opportunities)

The most simple form of booking with payment. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFree](https://openactive.io/test-interface#TestOpportunityBookableNonFree) x9, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x3



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/non-free-opportunities/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "non-free-opportunities": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [opportunity-paid-idempotency](./implemented/opportunity-paid-idempotency-test.js) | Successful booking of paid opportunity with idempotency | Testing idempotency of the B call for paid opportunities | [TestOpportunityBookableNonFree](https://openactive.io/test-interface#TestOpportunityBookableNonFree) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Successful booking with payment property | A successful end to end booking of a non-free opportunity with the `payment` property included if required. | [TestOpportunityBookableNonFree](https://openactive.io/test-interface#TestOpportunityBookableNonFree) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |
| [opportunity-paid-without-checkpoints](./implemented/opportunity-paid-without-checkpoints-test.js) | Successful booking without Checkpoints | Paid Opportunities should be bookable without using Checkpoints C1 & C2 if 1). tax calculations are not performed by the Booking System and 2). they do not require additional details | [TestOpportunityBookableNonFree](https://openactive.io/test-interface#TestOpportunityBookableNonFree) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "non-free-opportunities": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [no-paid-bookable-sessions](./not-implemented/no-paid-bookable-sessions-test.js) | No paid bookable session | Check that the feed does not include any bookable sessions with a non-zero price. |  |  |
