[< Return to Overview](../../README.md)
# accessPass - Seller provided access control barcodes  (access-pass-barcode-seller-provided)

Support for accessPass provided by the Seller, in the form of a barcode


https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-pass-barcode-seller-provided/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-pass-barcode-seller-provided": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-barcode-seller](./implemented/access-barcode-seller-test.js) | Successful booking with access barcode from seller. | Access pass contains barcode returned for B request from seller. | [TestOpportunityOfflineBookable](https://openactive.io/test-interface#TestOpportunityOfflineBookable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


