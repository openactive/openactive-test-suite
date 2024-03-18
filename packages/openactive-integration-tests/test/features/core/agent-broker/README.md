[< Return to Overview](../../README.md)
# AgentBroker mode (agent-broker)

Support for AgentBroker mode


https://www.openactive.io/open-booking-api/EditorsDraft/#agentbroker

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/agent-broker/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "agent-broker": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [customer-included](./implemented/customer-included-test.js) | Successful request when customer is included in Order in AgentBroker mode | Successful request when customer is included in Order in AgentBroker mode | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |
| [customer-not-included](./implemented/customer-not-included-test.js) | Customer not included in Order in AgentBroker mode | If customer is not included in Order in AgentBroker mode for C2 or B request, request should fail, returning 400 status code and IncompleteCustomerDetailsError. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |  |
