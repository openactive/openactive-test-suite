[< Return to Overview](../../README.md)
# prepayment optional (prepayment-optional)

Support for booking with optional payment


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreePrepaymentOptional](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional) x8



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/prepayment-optional/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-optional": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [opportunity-paid-incomplete-payment-details](./implemented/opportunity-paid-incomplete-payment-details-test.js) | IncompletePaymentDetailsError must be returned in the case that payment `identifier` is not supplied | An unsuccessful end to end booking, because `identifier` is missing in the `payment` property in B request. | [TestOpportunityBookableNonFreePrepaymentOptional](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional) x2 |  |
| [payment-mismatch](./implemented/payment-mismatch-test.js) | Expect a TotalPaymentDueMismatchError when the totalPaymentDue property does not match | Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue) | [TestOpportunityBookableNonFreePrepaymentOptional](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional) x2 |  |
| [with-payment](./implemented/with-payment-test.js) | Prepayment optional, with `payment` supplied, is successful | Opportunity paid, prepayment optional | [TestOpportunityBookableNonFreePrepaymentOptional](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional) x2 |  |
| [without-payment](./implemented/without-payment-test.js) | Prepayment optional, without `payment` supplied, is successful | Opportunity paid, prepayment optional, no `payment` (error) | [TestOpportunityBookableNonFreePrepaymentOptional](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentOptional) x2 |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-optional": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [prepayment-optional-not-in-use](./not-implemented/prepayment-optional-not-in-use-test.js) | The `openBookingPrepayment` property must not contain the value https://openactive.io/Optional | Assert that no opportunities that match criteria 'TestOpportunityBookableNonFreePrepaymentOptional' are available in the opportunity feeds. |  |  |
