[< Return to Overview](../../README.md)
# accessPass update notifications (access-pass-update-notifications)

Updating accessPass after an opportunity is booked

Required if accessPass can change

https://www.openactive.io/open-booking-api/EditorsDraft/#other-notifications

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-pass-update-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-pass-update-notifications](./implemented/access-pass-update-notifications-test.js) | Access pass updated after B request. | Access pass updated after B request is reflected in Orders feed. | [TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


