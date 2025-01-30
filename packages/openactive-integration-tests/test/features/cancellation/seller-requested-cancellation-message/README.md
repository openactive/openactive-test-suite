[< Return to Overview](../../README.md)
# cancellationMessage for Seller Requested Cancellation (seller-requested-cancellation-message)

A message associated with a Cancellation triggered by the Seller through the Booking System


https://www.openactive.io/open-booking-api/EditorsDraft/#seller-requested-cancellation

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4
### Test prerequisites - Test Interface Actions

The following Test Interface Actions must be implemented by the [test interface](https://openactive.io/test-interface/) of the booking system in order to test this feature (see the [Developer Docs guide for implementing Test Interface Actions](https://developer.openactive.io/open-booking-api/test-suite/implementing-the-test-interface/test-interface-actions)):

[SellerRequestedCancellationWithMessageSimulateAction](https://openactive.io/test-interface#SellerRequestedCancellationWithMessageSimulateAction)


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/seller-requested-cancellation-message/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "seller-requested-cancellation-message": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [seller-requested-cancellation-with-message](./implemented/seller-requested-cancellation-with-message-test.js) | Seller cancellation with message of order request. | A successful cancellation of order by seller, Order in feed should have status SellerCancelled and cancellation message | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 | [SellerRequestedCancellationWithMessageSimulateAction](https://openactive.io/test-interface#SellerRequestedCancellationWithMessageSimulateAction) |


