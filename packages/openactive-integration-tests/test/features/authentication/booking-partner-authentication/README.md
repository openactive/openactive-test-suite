[< Return to Overview](../../README.md)
# Booking Partner Authentication (booking-partner-authentication)

Separate Booking Partners should not be able to access/update each others' data


https://openactive.io/open-booking-api/EditorsDraft/#api-level-authentication-and-data-security

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4, [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/authentication/booking-partner-authentication/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "booking-partner-authentication": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [booking-partner-partitioning-for-order-proposals](./implemented/booking-partner-partitioning-for-order-proposals-test.js) | Booking Partners' Orders are Partitioned | Order Proposals from two different bookings partners must not be visible to each other, and UUID must be unique within each booking partner | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |
| [booking-partner-partitioning-for-orders](./implemented/booking-partner-partitioning-for-orders-test.js) | Booking Partners' Orders are Partitioned | Orders from two different bookings partners must not be visible to each other, and UUID must be unique within each booking partner | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |  |


