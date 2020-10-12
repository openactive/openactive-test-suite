[< Return to Overview](../../README.md)
# Named leasing, including leaseExpires (named-leasing)

Leasing at C2, reserving a space in the opportunity after the Customer has provided their contact information


https://www.openactive.io/open-booking-api/EditorsDraft/#leasing

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFiveSpaces](https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces) x2, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x5

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "named-leasing": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [lease-opportunity-capacity-update](./implemented/lease-opportunity-capacity-update-test.js) | Leased spaces are unavailable for purchase by other users | When an opportunity is leased, the capacity is decremented | [TestOpportunityBookableFiveSpaces](https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces) x2, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [lease-response](./implemented/lease-response-test.js) | Response at C2 includes a "lease" with a "leaseExpires" in the future | Named lease returned at C2 reserves the OrderItems for a specified length of time | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
