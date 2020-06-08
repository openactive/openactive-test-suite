[< Return to Overview](../../README.md)
# Customer Requested Cancellation (customer-requested-cancellation)

Cancellation triggered by the Customer through the Broker

https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values can be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1


### Running tests for only this feature

```bash
npm test --runInBand -- test/features/cancellation/customer-requested-cancellation/
```



## 'Implemented' tests

Update `test.json` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-requested-cancellation": true,
  ...
}
```


| Identifier | Name | Description | Prerequisites |
|------------|------|-------------|---------------|
| [book-and-cancel](./implemented/book-and-cancel-test.js) | Successful booking and cancellation. | A successful end to end booking including cancellation, including checking the Orders Feed. | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |


