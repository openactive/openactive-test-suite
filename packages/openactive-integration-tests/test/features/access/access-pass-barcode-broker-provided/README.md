[< Return to Overview](../../README.md)
# accessPass - Broker provided access control barcodes  (access-pass-barcode-broker-provided)

Support for accessPass provided by the Broker, in the form of a barcode


https://www.openactive.io/open-booking-api/EditorsDraft/#extension-point-for-barcode-based-access-control

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/access/access-pass-barcode-broker-provided/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-pass-barcode-broker-provided": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-barcode-broker](./implemented/access-barcode-broker-test.js) | Successful booking with access barcode from broker. | Barcode access pass provided by broker returned in B response. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


