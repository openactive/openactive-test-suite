[< Return to Overview](../../README.md)
# Opportunity attendance updates (opportunity-attendance-updates)

Allowing the broker to recieve updates for when an attendee attends an event


https://www.openactive.io/open-booking-api/EditorsDraft/#opportunity-attendance-updates

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
  "opportunity-attendance-updates": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-attendance-updates-test](./implemented/opportunity-attendance-updates-test-test.js) | Changes to an opportunity's attendance (via OpportunityAttendanceUpdateSimulateAction) should update the Order Feed. | After B, invoke an OpportunityAttendanceUpdateSimulateAction. This should create an update in the Order Feed with the OrderItem's orderItemStatus changed to CustomerAttended | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


