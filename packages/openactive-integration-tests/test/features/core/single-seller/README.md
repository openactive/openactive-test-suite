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
| [multiple-sellers-implemented](./not-implemented/multiple-sellers-implemented-test.js) | Single Seller feature must be implemented | Either one, and only one, of the Multiple Sellers feature and Single Seller feature must be implemented |  |
