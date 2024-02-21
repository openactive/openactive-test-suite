[< Return to Overview](../../README.md)
# Single Seller (single-seller)

The booking system only supports providing services to one seller.

This booking system must not have any data from any other sellers. (TODO2)

https://openactive.io/open-booking-api/EditorsDraft/#booking-pre-conditions

Coverage Status: **complete**



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/single-seller/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "single-seller": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [only-primary-seller-configured](./implemented/only-primary-seller-configured-test.js) | Only the primary seller should be configured | If the single-seller feature is implemented, multiple-sellers is not enabled, and so a secondary seller should not be configured. |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "single-seller": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [multiple-sellers-implemented](./not-implemented/multiple-sellers-implemented-test.js) | Multiple Sellers feature must be implemented if Single Seller is not implemented | Either one, and only one, of the Multiple Sellers feature and Single Seller feature must be implemented |  |
