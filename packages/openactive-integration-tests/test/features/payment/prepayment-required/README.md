[< Return to Overview](../../README.md)
# prepayment required (prepayment-required)

Support for booking with required payment


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x8


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/prepayment-required/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-required": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-paid-incomplete-payment-details](./implemented/opportunity-paid-incomplete-payment-details-test.js) | IncompletePaymentDetailsError must be returned in the case that payment details are not supplied | An unsuccessful end to end booking, because identifier is missing in the payment property in B request. | [TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x2 |
| [opportunity-paid-no-payment-error](./implemented/opportunity-paid-no-payment-error-test.js) | Unsuccessful booking without payment property | An unsuccessful end to end booking for a non-free opportunity, failing due to missing `payment` property. | [TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x2 |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Successful booking with payment property | A successful end to end booking with the `payment` property included. | [TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x2 |
| [payment-mismatch](./implemented/payment-mismatch-test.js) | Expect a TotalPaymentDueMismatchError when the totalPaymentDue property does not match | Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue) | [TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x2 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-required": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [prepayment-required-not-in-use](./not-implemented/prepayment-required-not-in-use-test.js) | The `openBookingPrepayment` property must not contain the value https://openactive.io/Required, or be unspecified for opportunities with non-zero price | Assert that no opportunities that match criteria 'TestOpportunityBookableNonFreePrepaymentRequired' are available in the opportunity feeds. |  |
