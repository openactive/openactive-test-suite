[< Return to Overview](../../README.md)
# accessCode update notifications (access-code-update-notifications)

Updating accessCode after an opportunity is booked

Required if accessCode can change

https://www.openactive.io/open-booking-api/EditorsDraft/#other-notifications

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
  "access-code-update-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-code-update-notifications-test](./implemented/access-code-update-notifications-test-test.js) | Access code updated after B request. | Access code updated after B request is reflected in Orders feed. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


