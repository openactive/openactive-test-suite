[< Return to Overview](../../README.md)
# Customer Details identifier capture (customer-details-capture-identifier)

Support for capturing the Broker's identifier for the customer. Note this field cannot be mandatory.


https://www.openactive.io/open-booking-api/EditorsDraft/#schema-person-for-customer-or-attendee

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-details-capture-identifier": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [customer-identifier-capture](./implemented/customer-identifier-capture-test.js) | C1, C2 and B - identifier is reflected back | Identifier from the Customer supplied by Broker should be reflected back by booking system. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


