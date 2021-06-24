[< Return to Overview](../../README.md)
# Opportunity attendance updates (opportunity-attendance-updates)

Allowing the broker to recieve updates for when an attendee attends an event


https://www.openactive.io/open-booking-api/EditorsDraft/#opportunity-attendance-updates

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/notifications/opportunity-attendance-updates/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "opportunity-attendance-updates": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-attendance-update-customer-absent](./implemented/opportunity-attendance-update-customer-absent-test.js) | Changes to an opportunity's attendance (via AttendeeAbsentSimulateAction) should update the Order Feed. | After B, invoke an `AttendeeAbsentSimulateAction`. This should create an update in the Order Feed with the OrderItem's orderItemStatus changed to `https://openactive.io/CustomerAttended` | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [opportunity-attendance-update-customer-attended](./implemented/opportunity-attendance-update-customer-attended-test.js) | Changes to an opportunity's attendance (via AttendeeAttendedSimulateAction) should update the Order Feed. | After B, invoke an `AttendeeAttendedSimulateAction`. This should create an update in the Order Feed with the OrderItem's orderItemStatus changed to `https://openactive.io/CustomerAttended` | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


