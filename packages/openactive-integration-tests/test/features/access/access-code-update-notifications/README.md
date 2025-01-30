[< Return to Overview](../../README.md)
# accessCode update notifications (access-code-update-notifications)

Updating accessCode after an opportunity is booked

Required if accessCode can change

https://www.openactive.io/open-booking-api/EditorsDraft/#other-notifications

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1
### Test prerequisites - Test Interface Actions

The following Test Interface Actions must be implemented by the [test interface](https://openactive.io/test-interface/) of the booking system in order to test this feature (see the [Developer Docs guide for implementing Test Interface Actions](https://developer.openactive.io/open-booking-api/test-suite/implementing-the-test-interface/test-interface-actions)):

[AccessCodeUpdateSimulateAction](https://openactive.io/test-interface#AccessCodeUpdateSimulateAction)


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-code-update-notifications/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-code-update-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [access-code-update-notifications](./implemented/access-code-update-notifications-test.js) | Access code updated after B request. | Access code updated after B request is reflected in Orders feed. | [TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 | [AccessCodeUpdateSimulateAction](https://openactive.io/test-interface#AccessCodeUpdateSimulateAction) |


