[< Return to Overview](../../README.md)
# accessPass - Seller provided access control barcodes  (access-pass-barcode-seller-provided)

Support for accessPass provided by the Seller, in the form of a barcode


https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


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
| [access-barcode-seller](./implemented/access-barcode-seller-test.js) | Successful booking with access barcode from seller. | Access pass contains barcode returned for B request from seller. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


