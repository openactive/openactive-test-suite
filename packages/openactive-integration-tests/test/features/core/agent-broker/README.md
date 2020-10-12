[< Return to Overview](../../README.md)
# AgentBroker mode (agent-broker)

Support for AgentBroker mode


https://www.openactive.io/open-booking-api/EditorsDraft/#agentbroker

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "agent-broker": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [customer-not-included](./implemented/customer-not-included-test.js) | Customer not included in Order in AgentBroker mode | If customer is not included in Order in AgentBroker mode for B request, request shoud fail, returning 400 status code and IncompleteCustomerDetailsError. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


