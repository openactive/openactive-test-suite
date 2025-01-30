[< Return to Overview](../../README.md)
# Free opportunities (free-opportunities)

The most simple form of booking, for free opportunities. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#free-opportunities

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x14



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/free-opportunities/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "free-opportunities": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [opportunity-free-idempotency](./implemented/opportunity-free-idempotency-test.js) | Successful booking of free opportunity with idempotency | Testing idempotency of the B call for free opportunities | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4 |  |
| [opportunity-free-must-not-include-prepayment](./implemented/opportunity-free-must-not-include-prepayment-test.js) | Free opportunities must have either a `openBookingPrepayment` value of Unspecified, or have no `openBookingPrepayment` specified | Assert that no opportunities that match criteria 'TestOpportunityBookableFreePrepaymentOptional' or 'TestOpportunityBookableFreePrepaymentRequired' are available in the opportunity feeds. |  |  |
| [opportunity-free](./implemented/opportunity-free-test.js) | Successful booking without payment property | A successful end to end booking without the `payment` property included. | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x2 |  |
| [opportunity-free-unnecessary-payment-error](./implemented/opportunity-free-unnecessary-payment-error-test.js) | Fail free bookings which include erroneous payment property | C1, C2 and B with payment property: payment property is provided but not expected in the request, so an UnnecessaryPaymentDetailsError must be returned. | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x2 |  |
| [opportunity-free-without-checkpoints](./implemented/opportunity-free-without-checkpoints-test.js) | Successful booking without Checkpoints | Free Opportunities, as they need no tax calculation by the Booking System, and, if they do not require additional details, should be bookable without using Checkpoints C1 & C2 | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x4 |  |
| [payment-mismatch](./implemented/payment-mismatch-test.js) | Expect a TotalPaymentDueMismatchError when the totalPaymentDue property is non-zero for free opportunities | Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue) | [TestOpportunityBookableFree](https://openactive.io/test-interface#TestOpportunityBookableFree) x2 |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "free-opportunities": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [no-free-opportunities](./not-implemented/no-free-opportunities-test.js) | The open data feeds must not contain any free opportunities | Assert that no opportunities that match criteria 'TestOpportunityBookableFree' are available in the opportunity feeds. |  |  |
