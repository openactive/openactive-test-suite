[< Return to Overview](../../README.md)
# latestCancellationBeforeStartDate cancellation window (cancellation-window)

A defined window before the event occurs where it can be cancelled without fees


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableCancellableOutsideWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableOutsideWindow) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2, [TestOpportunityBookableCancellableWithinWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableWithinWindow) x3

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "cancellation-window": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [fail-outside-window](./implemented/fail-outside-window-test.js) | Successful booking and failed cancellation outside window. | A successful end to end booking, but cancellation fails outside the cancellation window. | [TestOpportunityBookableCancellableOutsideWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableOutsideWindow) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [succeed-within-window](./implemented/succeed-within-window-test.js) | Successful booking and cancellation within window. | A successful end to end booking including cancellation within the cancellation window. | [TestOpportunityBookableCancellableWithinWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableWithinWindow) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


