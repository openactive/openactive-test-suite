[< Return to Overview](../../README.md)
# accessCode - manual access codes (access-code)

Support for accessCode provided for a successful booking


https://www.openactive.io/open-booking-api/EditorsDraft/#text-based-access-control

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-code/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-code": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [manual-access-codes](./implemented/manual-access-codes-test.js) | Successful booking with access codes. | Access codes returned for B request. | [TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |


