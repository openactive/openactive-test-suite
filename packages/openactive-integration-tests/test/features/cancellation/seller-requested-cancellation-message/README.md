[< Return to Overview](../../README.md)
# cancellationMessage for Seller Requested Cancellation (seller-requested-cancellation-message)

A message associated with a Cancellation triggered by the Seller through the Booking System


https://www.openactive.io/open-booking-api/EditorsDraft/#seller-requested-cancellation

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "seller-requested-cancellation-message": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [seller-requested-cancellation-with-message](./implemented/seller-requested-cancellation-with-message-test.js) | Seller cancellation with message of order request. | A successful cancellation of order by seller, Order in feed should have status SellerCancelled and cancellation message | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


