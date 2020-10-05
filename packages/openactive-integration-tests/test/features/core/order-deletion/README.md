[< Return to Overview](../../README.md)
# Order Deletion Endpoint (order-deletion)

Check that Order Deletion correctly soft-deletes an Order that has already been emitted in the Orders feed


https://www.openactive.io/open-booking-api/EditorsDraft/#order-deletion

Coverage Status: **none**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-6-orders-feed)


*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "order-deletion": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [unknown-order](./implemented/unknown-order-test.js) | Expect a UnknownOrderError for an Order that does not exist | Runs Order Deletion for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned |  |


