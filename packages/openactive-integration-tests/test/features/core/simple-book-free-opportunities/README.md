[< Return to Overview](../../README.md)
# Simple Booking of free opportunities (simple-book-free-opportunities)

The most simple form of booking, for free opportunities. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#free-opportunities

Coverage Status: **partial**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start --runInBand -- test/features/core/simple-book-free-opportunities/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "simple-book-free-opportunities": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [without-payment-property](./implemented/without-payment-property-test.js) | Successful booking without payment property | A successful end to end booking without the `payment` property included. | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
