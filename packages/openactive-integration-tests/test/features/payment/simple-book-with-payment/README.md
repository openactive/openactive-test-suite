[< Return to Overview](../../README.md)
# Simple Booking of paid opportunities (simple-book-with-payment)

Open Booking API Test Interface implementation

https://openactive.io/test-interface/

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values can be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x4, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1

### Running tests for only this feature

```bash
npm test --runInBand -- test/features/payment/simple-book-with-payment/
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


| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
| undefined | with-payment-property | A successful end to end booking with the `payment` property included. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


## 'Not Implemented' tests

Update `test.json` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "simple-book-with-payment": false,
  ...
}
```


| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
| undefined | no-paid-bookable-sessions | Check that the feed does not include any bookable sessions with a non-zero price. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x1 |
