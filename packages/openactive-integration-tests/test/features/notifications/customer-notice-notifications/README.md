[< Return to Overview](../../README.md)
# Customer notice notifications (customer-notice-notifications)

Text notifications broadcast to all registered attendees of an opportunity


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-notice-notifications

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4
### Test prerequisites - Test Interface Actions

The following Test Interface Actions must be implemented by the [test interface](https://openactive.io/test-interface/) of the booking system in order to test this feature (see the [Developer Docs guide for implementing Test Interface Actions](https://developer.openactive.io/open-booking-api/test-suite/implementing-the-test-interface/test-interface-actions)):

[CustomerNoticeSimulateAction](https://openactive.io/test-interface#CustomerNoticeSimulateAction)


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/notifications/customer-notice-notifications/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-notice-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [customer-notice-notification](./implemented/customer-notice-notification-test.js) | Changes to an OrderItem's customerNotice (via CustomerNoticeSimulateAction) should update the Order Feed. | After B, invoke a CustomerNoticeSimulateAction. This should create an update in the Order Feed with the OrderItem's customerNotice changed. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 | [CustomerNoticeSimulateAction](https://openactive.io/test-interface#CustomerNoticeSimulateAction) |


