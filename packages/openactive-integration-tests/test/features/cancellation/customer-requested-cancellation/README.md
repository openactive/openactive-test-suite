[< Return to Overview](../../README.md)
# Customer Requested Cancellation (customer-requested-cancellation)

Cancellation triggered by the Customer through the Broker


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **partial**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-7-cancellation)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x3


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/customer-requested-cancellation/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-requested-cancellation": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [book-and-cancel](./implemented/book-and-cancel-test.js) | Successful booking and cancellation. | A successful end to end booking including cancellation, including checking the Orders Feed. | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |
| [patch-contains-excessive-properties-error](./implemented/patch-contains-excessive-properties-error-test.js) | Successful booking and unsuccessful cancellation due to PatchContainsExcessivePropertiesError | PatchContainsExcessivePropertiesError returned because patch request includes other properties than @type, @context, orderProposalStatus and orderCustomerNote | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |
| [patch-not-allowed-on-property-error](./implemented/patch-not-allowed-on-property-error-test.js) | Successful booking and unsuccessful cancellation due to PatchNotAllowedOnPropertyError | PatchNotAllowedOnPropertyError returned because patch request includes order item status different than CustomerCancelled | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x1 |
| [unknown-order](./implemented/unknown-order-test.js) | Expect a UnknownOrderError for an Order that does not exist | Runs Order Cancellation for a non-existent Order (with a fictional UUID), expecting an UnknownOrderError error to be returned |  |


