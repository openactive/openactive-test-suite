[< Return to Overview](../../README.md)
# prepayment unavailable (prepayment-unavailable)

Support for booking without payment (reservation only)


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x12, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/prepayment-unavailable/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-unavailable": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [opportunity-paid-incomplete-payment-details](./implemented/opportunity-paid-incomplete-payment-details-test.js) | UnnecessaryPaymentDetailsError must be returned when payment property (incomplete or otherwise) is included | When prepayment is unavailable, include an incomplete `payment` object for B. Even though the `payment` object is incomplete, the Booking System should only respond to the fact that `payment` is included when it is unecessary, therefore returning an UnnecessaryPaymentDetailsError | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Successfully book paid Opportunity | Successful booking of a paid Opportunity, where prepayment is unavailable, without `payment` property | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
| [opportunity-paid-unnecessary-payment-error](./implemented/opportunity-paid-unnecessary-payment-error-test.js) | Fail on unnecessary payment property | For a paid Opportunity, where prepayment is unavailable, attempt to book with an extraneous `payment` property. Booking should fail with UnnecessaryPaymentDetailsError | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
| [payment-mismatch](./implemented/payment-mismatch-test.js) | Expect a TotalPaymentDueMismatchError when the totalPaymentDue property does not match | Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue) | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-unavailable": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [prepayment-unavailable-not-in-use](./not-implemented/prepayment-unavailable-not-in-use-test.js) | The `prepayment` property must not contain the value https://openactive.io/Unavailable | Assert that no opportunities that match criteria 'TestOpportunityBookableNonFreePrepaymentUnavailable' are available in the opportunity feeds. |  |
