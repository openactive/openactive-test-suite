[< Return to Overview](../../README.md)
# latestCancellationBeforeStartDate cancellation window (cancellation-window)

A defined window before the event occurs where it can be cancelled without fees


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **none**


*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*




## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "cancellation-window": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [assert-unmatched-criteria](./not-implemented/assert-unmatched-criteria-test.js) | Opportunities relevant to this not-implemented feature must not be available in opportunity feeds | Assert that no opportunities that match criteria 'TestOpportunityBookableCancellableWithinWindow' or 'TestOpportunityBookableCancellableOutsideWindow' are available in the opportunity feeds. |  |
