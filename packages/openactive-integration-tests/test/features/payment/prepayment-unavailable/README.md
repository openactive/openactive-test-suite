[< Return to Overview](../../README.md)
# prepayment unavailable (prepayment-unavailable)

Support for booking without payment (reservation only)


https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x12, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


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
| [opportunity-paid-incomplete-payment-details](./implemented/opportunity-paid-incomplete-payment-details-test.js) | IncompletePaymentDetailsError must be returned in the case that payment details are not supplied | An unsuccessful end to end booking, because identifier is missing in the payment property in B request. | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
| [opportunity-paid](./implemented/opportunity-paid-test.js) | Opportunity paid | Opportunity paid, prepayment unavailable | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
| [opportunity-paid-unnecessary-payment-error](./implemented/opportunity-paid-unnecessary-payment-error-test.js) | Opportunity paid (unnecessary payment error) | Opportunity paid, prepayment unavailable, unnecessary payment (error) | [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x3, [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x1 |
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
| [prepayment-unavailable-not-in-use](./not-implemented/prepayment-unavailable-not-in-use-test.js) | The `prepayment` property must not contain the value https://openactive.io/Unavailable | Assert that no opportunities that match criteria 'TestOpportunityBookablePaidPrepaymentUnavailable' are available in the opportunity feeds. |  |
