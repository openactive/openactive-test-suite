[< Return to Overview](../../README.md)
# Change of logistics notifications (change-of-logistics-notifications)

Notifications for when an opportunity's name, location, or start/end date/time are updated 

Required if logistics of event can change

https://www.openactive.io/open-booking-api/EditorsDraft/#change-of-logistics-notifications

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "change-of-logistics-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [change-of-logistics-notifications](./implemented/change-of-logistics-notifications-test.js) | Updating logistics information in after B request. | ChangeOfLogisticsSimulateAction triggered after B request to update name, startDate, endDate, duration or location properties of Opportunity. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


