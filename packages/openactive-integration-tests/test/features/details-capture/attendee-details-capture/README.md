[< Return to Overview](../../README.md)
# Simple Book including Attendee Details capture (attendee-details-capture)

Support for capturing attendee details


https://www.openactive.io/open-booking-api/EditorsDraft/#attendee-details-capture

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableAttendeeDetails](https://openactive.io/test-interface#TestOpportunityBookableAttendeeDetails) x6, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "attendee-details-capture": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [attendee-details-included](./implemented/attendee-details-included-test.js) | Booking opportunity with attendeeDetails included | Should succeed | [TestOpportunityBookableAttendeeDetails](https://openactive.io/test-interface#TestOpportunityBookableAttendeeDetails) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [attendee-details-not-included](./implemented/attendee-details-not-included-test.js) | Booking opportunity with attendeeDetails not included | Should error | [TestOpportunityBookableAttendeeDetails](https://openactive.io/test-interface#TestOpportunityBookableAttendeeDetails) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


