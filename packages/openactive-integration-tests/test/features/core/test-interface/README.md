[< Return to Overview](../../README.md)
# Test interface (test-interface)

Open Booking API Test Interface implementation


https://openactive.io/test-interface/

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/test-interface/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "test-interface": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [create-opportunity](./implemented/create-opportunity-test.js) | Create opportunity | Creates an opportunity using the booking system's test interface, and validates the resulting feed item matches the criteria. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |


