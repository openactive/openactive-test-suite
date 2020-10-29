[< Return to Overview](../../README.md)
# NoBroker mode (no-broker)

Support for NoBroker mode, for example for operators to use the Open Booking API to power their own websites


https://www.openactive.io/open-booking-api/EditorsDraft/#nobroker

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x12

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "no-broker": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [broker-included-nobroker-mode](./implemented/broker-included-nobroker-mode-test.js) | Broker included in Order in NoBroker mode | Request shoud fail if broker is included in Order in NoBroker mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [customer-included-nobroker-mode](./implemented/customer-included-nobroker-mode-test.js) | Customer included in Order in NoBroker mode | Request shoud succeed if customer is included in Order in NoBroke mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [customer-not-included-nobroker-mode](./implemented/customer-not-included-nobroker-mode-test.js) | Customer not included in Order in NoBroker mode | Request shoud succeed if customer is not included in Order in NoBroker mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


