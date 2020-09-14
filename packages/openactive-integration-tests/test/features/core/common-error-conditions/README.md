[< Return to Overview](../../README.md)
# Common error conditions (common-error-conditions)

Tests C1, C2 and B for common error conditions applicable to all implementations


https://openactive.io/open-booking-api/EditorsDraft/#error-model

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x21, [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/common-error-conditions/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "common-error-conditions": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [incomplete-broker-details](./implemented/incomplete-broker-details-test.js) | Expect an IncompleteBrokerDetailsError when broker details are missing name | Run each of C1, C2 and B for a valid opportunity, with broker details incomplete (missing name), expecting an IncompleteBrokerDetailsError to be returned | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x12 |
| [incomplete-customer-details](./implemented/incomplete-customer-details-test.js) | Expect an IncompleteCustomerDetailsError when customer details are incomplete | Run each of C2 and B for a valid opportunity, with customer details incomplete, expecting an IncompleteCustomerDetailsError to be returned (C1 is ignored because customer details are not accepted for C1) | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8 |
| [not-found](./implemented/not-found-test.js) | Expect a NotFoundError for Orders that do not exist | Runs Order Cancellation for an non-existent Order (with a fictional UUID), expecting an NotFoundError error to be returned |  |
| [order-already-exists](./implemented/order-already-exists-test.js) | Expect an OrderAlreadyExistsError if an Order UUID exists but with different OrderItems | Do a successful C1, C2, B run. Then, run B again for the same Order UUID, but with different OrderItems. Expect an OrderAlreadyExistsError. | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x1 |
| [payment-mismatch](./implemented/payment-mismatch-test.js) | Expect a TotalPaymentDueMismatchError when the totalPaymentDue property does not match | Run B for a valid opportunity, with totalPaymentDue not matching the value returned by C2, expecting a TotalPaymentDueMismatchError to be returned (C1 and C2 ignored as they do not have totalPaymentDue) | [TestOpportunityBookablePaid](https://openactive.io/test-interface#TestOpportunityBookablePaid) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
