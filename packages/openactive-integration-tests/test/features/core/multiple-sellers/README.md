[< Return to Overview](../../README.md)
# Multiple Sellers (multiple-sellers)

The booking system is multi-tenanted and provides services to multiple sellers.

It is not possible for Opportunities from different Sellers to be combined in the same Order.

https://openactive.io/open-booking-api/EditorsDraft/#booking-pre-conditions

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x6


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
| [conflicting-seller](./implemented/conflicting-seller-test.js) | SellerMismatchError for inconsistent Sellers of OrderItems | Runs C1, C2 and B where Sellers of OrderItems do not match and check SellerMismatchError is returned in all cases. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x2 |
| [seller-access-restricted-by-auth](./implemented/seller-access-restricted-by-auth-test.js) | Credentials for Seller (a) must not provide access to make bookings for Seller (b) | Using primary seller auth, make a call to C1, C2, and P/B for the secondary seller, expecting all calls to fail with InvalidAuthorizationDetailsError | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "multiple-sellers": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [single-seller-implemented](./not-implemented/single-seller-implemented-test.js) | Single Seller feature must be implemented | Either one, and only one, of the Multiple Sellers feature and the Single Seller feature must be implemented |  |
