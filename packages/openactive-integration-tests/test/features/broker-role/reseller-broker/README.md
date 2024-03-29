[< Return to Overview](../../README.md)
# ResellerBroker mode (reseller-broker)

Support for ResellerBroker mode


https://www.openactive.io/open-booking-api/EditorsDraft/#resellerbroker

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x12



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/broker-role/reseller-broker/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "reseller-broker": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [broker-not-included-resellerbroker-mode](./implemented/broker-not-included-resellerbroker-mode-test.js) | Broker not included in Order in ResellerBroker mode | Request shoud fail if broker is not included in Order in ResellerBroke mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |
| [customer-included-resellerbroker-mode](./implemented/customer-included-resellerbroker-mode-test.js) | Customer included in Order in ResellerBroker mode | Request should succeed if broker and customer are included in Order in ResellerBroke mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |
| [customer-not-included-resellerbroker-mode](./implemented/customer-not-included-resellerbroker-mode-test.js) | Customer not included in Order in ResellerBroker mode | Request should succeed if customer is not included in Order in ResellerBroke mode for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |


