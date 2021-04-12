[< Return to Overview](../../README.md)
# Seller Requested Cancellation (seller-requested-cancellation)

Cancellation triggered by the Seller through the Booking System


https://www.openactive.io/open-booking-api/EditorsDraft/#seller-requested-cancellation

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-6-orders-feed)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/seller-requested-cancellation/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "seller-requested-cancellation": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [seller-requested-cancellation](./implemented/seller-requested-cancellation-test.js) | Seller cancellation of order request. | A successful cancellation of order by seller, Order in feed should have status SellerCancelled | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


