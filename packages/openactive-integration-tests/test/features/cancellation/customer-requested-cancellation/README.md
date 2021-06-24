[< Return to Overview](../../README.md)
# Customer Requested Cancellation (customer-requested-cancellation)

Cancellation triggered by the Customer through the Broker


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-requested-cancellation

Coverage Status: **complete**

See also: [.NET Tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-7-cancellation)
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x18, [TestOpportunityBookableNotCancellable](https://openactive.io/test-interface#TestOpportunityBookableNotCancellable) x1, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


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
| [atomic-cancel](./implemented/atomic-cancel-test.js) | Successful booking and successful cancellation after atomic failed cancellation request | After a successful booking, and an unsuccessful but atomic cancellation request, successfully cancel, including checking the Orders feed. Atomic means that the cancellation request either entirely succeeds (all OrderItems items are cancelled) or entirely fails (no OrderItems are cancelled), which is generally best achieved by wrapping code in a database transaction. | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x2, [TestOpportunityBookableNotCancellable](https://openactive.io/test-interface#TestOpportunityBookableNotCancellable) x1 |
| [book-and-cancel](./implemented/book-and-cancel-test.js) | Successful booking and cancellation. | A successful end to end booking including full Order cancellation, including checking the Orders Feed. Two cancellation requests are made to ensure that cancellation is atomic. | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x4 |
| [orderitem-id-invalid-error](./implemented/orderitem-id-invalid-error-test.js) | Expect a OrderItemIdInvalidError for an Order that does not exist | Runs Order Cancellation for a non-existent invalid OrderItem, but real Order, expecting an OrderItemIdInvalidError error to be returned | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [orderitem-not-within-order-error](./implemented/orderitem-not-within-order-error-test.js) | Expect a OrderItemNotWithinOrderError for an Order that does not exist | Runs Order Cancellation for a non-existent Order (with a fictional UUID), but real OrderItem, expecting an OrderItemNotWithinOrderError error to be returned | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [patch-contains-excessive-properties-error](./implemented/patch-contains-excessive-properties-error-test.js) | Successful booking and unsuccessful cancellation due to PatchContainsExcessivePropertiesError | PatchContainsExcessivePropertiesError returned because patch request includes other properties than @type, @context, orderProposalStatus and orderCustomerNote | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [patch-not-allowed-on-property-error](./implemented/patch-not-allowed-on-property-error-test.js) | Successful booking and unsuccessful cancellation due to PatchNotAllowedOnPropertyError | PatchNotAllowedOnPropertyError returned because patch request includes order item status different than CustomerCancelled | [TestOpportunityBookableCancellable](https://openactive.io/test-interface#TestOpportunityBookableCancellable) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


