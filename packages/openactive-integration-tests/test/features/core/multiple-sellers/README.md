[< Return to Overview](../../README.md)
# Multiple Sellers (multiple-sellers)

The booking system is multi-tenanted and provides services to multiple sellers.

It is not possible for Opportunities from different Sellers to be combined in the same Order.

https://openactive.io/open-booking-api/EditorsDraft/#booking-pre-conditions

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x2


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/multiple-sellers/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "multiple-sellers": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [conflicting-seller](./implemented/conflicting-seller-test.js) | SellerMismatchError for inconsistent Sellers of OrderItems | Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases. | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x2 |


