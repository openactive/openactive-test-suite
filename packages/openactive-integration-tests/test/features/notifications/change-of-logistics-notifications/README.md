[< Return to Overview](../../README.md)
# Change of logistics notifications (change-of-logistics-notifications)

Notifications for when an opportunity's name, location, or start/end date/time are updated 

Required if logistics of event can change

https://www.openactive.io/open-booking-api/EditorsDraft/#change-of-logistics-notifications

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x12
### Test prerequisites - Test Interface Actions

The following Test Interface Actions must be implemented by the [test interface](https://openactive.io/test-interface/) of the booking system in order to test this feature:

[ChangeOfLogisticsLocationSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsLocationSimulateAction), [ChangeOfLogisticsNameSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsNameSimulateAction), [ChangeOfLogisticsTimeSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsTimeSimulateAction)


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/notifications/change-of-logistics-notifications/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "change-of-logistics-notifications": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [change-of-logistics-notifications-location](./implemented/change-of-logistics-notifications-location-test.js) | Updating location information after B request. | ChangeOfLogisticsLocationSimulateAction triggered after B request to update the `location` property of the Opportunity. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 | [ChangeOfLogisticsLocationSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsLocationSimulateAction) |
| [change-of-logistics-notifications-name](./implemented/change-of-logistics-notifications-name-test.js) | Updating name information after B request. | ChangeOfLogisticsNameSimulateAction triggered after B request to update the `name` property of the Opportunity. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 | [ChangeOfLogisticsNameSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsNameSimulateAction) |
| [change-of-logistics-notifications-time](./implemented/change-of-logistics-notifications-time-test.js) | Updating time information after B request. | ChangeOfLogisticsTimeSimulateAction triggered after B request to update the time properties of the Opportunity (e.g. `startDate`). | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 | [ChangeOfLogisticsTimeSimulateAction](https://openactive.io/test-interface#ChangeOfLogisticsTimeSimulateAction) |


