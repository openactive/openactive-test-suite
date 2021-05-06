[< Return to Overview](../../README.md)
# Payment reconciliation detail validation (payment-reconciliation-detail-validation)

Booking with valid, invalid, and missing Payment details


https://www.openactive.io/open-booking-api/EditorsDraft/#payment-reconciliation-detail-validation

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x12, [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x15, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x5


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/payment-reconciliation-detail-validation/
```



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
| [payment-reconciliation-detail-validation-incorrect-details-no-payment-required](./implemented/payment-reconciliation-detail-validation-incorrect-details-no-payment-required-test.js) | Payment reconciliation detail validation - incorrect reconciliation details, when no payment required | B should return an InvalidPaymentDetailsError due to incorrect reconciliation data | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4 |
| [payment-reconciliation-detail-validation-incorrect-details](./implemented/payment-reconciliation-detail-validation-incorrect-details-test.js) | Payment reconciliation detail validation - incorrect reconciliation details, when payment required | B should return an InvalidPaymentDetailsError due to incorrect reconciliation data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-missing-details-no-payment-required](./implemented/payment-reconciliation-detail-validation-missing-details-no-payment-required-test.js) | Payment reconciliation detail validation - missing reconciliation details, when no payment required | B should return an InvalidPaymentDetailsError due to missing reconciliation data | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4 |
| [payment-reconciliation-detail-validation-missing-details](./implemented/payment-reconciliation-detail-validation-missing-details-test.js) | Payment reconciliation detail validation - missing reconciliation details, when payment required | B should return an InvalidPaymentDetailsError due to missing reconciliation data | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation-no-payment-required](./implemented/payment-reconciliation-detail-validation-no-payment-required-test.js) | Payment reconciliation detail validation, where payment is not required | C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4 |
| [payment-reconciliation-detail-validation](./implemented/payment-reconciliation-detail-validation-test.js) | Payment reconciliation detail validation, where payment is required | C1, C2 and B including globally configured accountId, paymentProviderId and name should succeed | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



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
| [payment-reconciliation-detail-validation-missing-details](./not-implemented/payment-reconciliation-detail-validation-missing-details-test.js) | Payment reconciliation detail validation - missing reconciliation details | C1, C2 and B - with missing reconciliation details - should succeed, ignoring these values | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [payment-reconciliation-detail-validation](./not-implemented/payment-reconciliation-detail-validation-test.js) | Payment reconciliation detail validation | C1, C2 and B - including reconciliation details - should succeed, ignoring these values | [TestOpportunityBookableUsingPayment](https://openactive.io/test-interface#TestOpportunityBookableUsingPayment) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
