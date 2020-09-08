[< Return to Overview](../../README.md)
# Common error conditions (common-error-conditions)

Tests C1, C2 and B for common error conditions applicable to all implementations


https://openactive.io/open-booking-api/EditorsDraft/#error-model

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


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
| [incomplete-customer-details](./implemented/incomplete-customer-details-test.js) | Expect an IncompleteCustomerDetailsError when customer details are incomplete | Run each of C2 and B for a valid opportunity, with customer details incomplete, expecting an IncompleteCustomerDetailsError to be returned (C1 is ignored because customer details are not accepted for C1) | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [not-found](./implemented/not-found-test.js) | Expect a NotFoundError for Orders that do not exist | Runs Order Cancellation for an non-existent Order (with a fictional UUID), expecting an NotFoundError error to be returned |  |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
