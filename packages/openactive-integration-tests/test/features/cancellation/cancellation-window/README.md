[< Return to Overview](../../README.md)
# latestCancellationBeforeStartDate cancellation window (cancellation-window)

A defined window before the event occurs where it can be cancelled without fees


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableCancellableOutsideWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableOutsideWindow) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2, [TestOpportunityBookableCancellableWithinWindow](https://openactive.io/test-interface#TestOpportunityBookableCancellableWithinWindow) x3, [undefined](https://openactive.io/test-interface#undefined) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/cancellation-window/
```



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
| [assert-unmatched-criteria](./not-implemented/assert-unmatched-criteria-test.js) | Opportunities relevant to this not-implemented feature must not be available in opportunity feeds | Assert that no opportunities that match criteria 'TestOpportunityBookableCancellableWithinWindow' or 'TestOpportunityBookableCancellableOutsideWindow' are available in the opportunity feeds. | [undefined](https://openactive.io/test-interface#undefined) x1 |
