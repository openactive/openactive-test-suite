[< Return to Overview](../../README.md)
# Simple Booking of paid opportunities (simple-book-with-payment)

The most simple form of booking with payment. Does not check for leases.


https://www.openactive.io/open-booking-api/EditorsDraft/#step-by-step-process-description

Coverage Status: **partial**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-5-b-and-delete-order)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x4, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start --runInBand -- test/features/payment/simple-book-with-payment/
```



## 'Implemented' tests

Update `test.json` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "simple-book-with-payment": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [with-payment-property](./implemented/with-payment-property-test.js) | Successful booking with payment property | A successful end to end booking with the `payment` property included. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


Update `test.json` as follows to enable 'Not Implemented' testing for this feature:

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
