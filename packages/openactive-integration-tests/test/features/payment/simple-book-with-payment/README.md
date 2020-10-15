[< Return to Overview](../../README.md)
# Simple Booking of paid opportunities (simple-book-with-payment)

The most simple form of booking with payment. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description

Coverage Status: **partial**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x10, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x3


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/simple-book-with-payment/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "simple-book-with-payment": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [b-with-incomplete-payment-details](./implemented/b-with-incomplete-payment-details-test.js) | IncompletePaymentDetailsError must be returned in the case that payment details are not supplied | An unsuccessful end to end booking, because identifier is missing in the payment property in B request. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [b-without-payment-property](./implemented/b-without-payment-property-test.js) | Unsuccessful booking without payment property | An unsuccessful end to end booking for a non-free opportunity, failing due to missing `payment` property. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [with-payment-property](./implemented/with-payment-property-test.js) | Successful booking with payment property | A successful end to end booking with the `payment` property included. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "simple-book-with-payment": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [no-paid-bookable-sessions](./not-implemented/no-paid-bookable-sessions-test.js) | No paid bookable session | Check that the feed does not include any bookable sessions with a non-zero price. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x1 |
