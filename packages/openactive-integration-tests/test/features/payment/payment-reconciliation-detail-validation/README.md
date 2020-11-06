[< Return to Overview](../../README.md)
# Payment reconciliation detail validation (payment-reconciliation-detail-validation)

Booking with valid, invalid, and missing Payment details


https://www.openactive.io/open-booking-api/EditorsDraft/#payment-reconciliation-detail-validation

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x30, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x10

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "payment-reconciliation-detail-validation": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [payment-reconciliation-detail-validation-incorrect-details](./implemented/payment-reconciliation-detail-validation-incorrect-details-test.js) | Payment reconciliation detail validation - incorrect reconciliation details | B should return an InvalidPaymentDetailsError due to incorrect reconciliation data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-invalid-accountId](./implemented/payment-reconciliation-detail-validation-invalid-accountId-test.js) | Payment reconciliation detail validation - invalid accountId | B should return an InvalidPaymentDetailsError due to invalid requisition data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-invalid-paymentProviderId](./implemented/payment-reconciliation-detail-validation-invalid-paymentProviderId-test.js) | Payment reconciliation detail validation - invalid paymentProviderId | B should return an InvalidPaymentDetailsError due to invalid requisition data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-missing-accountId](./implemented/payment-reconciliation-detail-validation-missing-accountId-test.js) | Payment reconciliation detail validation - missing accountId | B should return an InvalidPaymentDetailsError due to missing requisition data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-missing-details](./implemented/payment-reconciliation-detail-validation-missing-details-test.js) | Payment reconciliation detail validation - missing reconciliation details | B should return an InvalidPaymentDetailsError due to missing reconciliation data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-missing-paymentProviderId](./implemented/payment-reconciliation-detail-validation-missing-paymentProviderId-test.js) | Payment reconciliation detail validation - missing paymentProviderId | B should return an InvalidPaymentDetailsError due to missing requisition data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation](./implemented/payment-reconciliation-detail-validation-test.js) | Payment reconciliation detail validation | C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "payment-reconciliation-detail-validation": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [payment-reconciliation-detail-validation-missing-accountId](./not-implemented/payment-reconciliation-detail-validation-missing-accountId-test.js) | Payment reconciliation detail validation - missing accountId | C1, C2 and B including paymentProviderId and name should succeed, ignoring these values | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-missing-details](./not-implemented/payment-reconciliation-detail-validation-missing-details-test.js) | Payment reconciliation detail validation - missing reconciliation details | C1, C2 and B - with missing reconciliation details - should succeed, ignoring these values | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation](./not-implemented/payment-reconciliation-detail-validation-test.js) | Payment reconciliation detail validation | C1, C2 and B - including reconciliation details - should succeed, ignoring these values | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
