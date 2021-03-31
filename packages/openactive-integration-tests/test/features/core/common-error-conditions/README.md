[< Return to Overview](../../README.md)
# Common error conditions (common-error-conditions)

Tests C1, C2 and B for common error conditions applicable to all implementations


https://openactive.io/open-booking-api/EditorsDraft/#error-model

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x25, [TestOpportunityBookableOutsideValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate) x3


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
| [incomplete-order-item](./implemented/incomplete-order-item-test.js) | Test for IncompleteOrderItemError (at C1, C2 and B) | Test for IncompleteOrderItemError (at C1, C2 and B). If there is a missing acceptedOffer or orderedItem property on the OrderItem. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [not-bookable](./implemented/not-bookable-test.js) | Expect an OpportunityOfferPairNotBookableError when booking not bookable opportunity | Runs C1, C2 and B for an opportunity that is not bookable, expecting an OpportunityOfferPairNotBookableError to be returned | [TestOpportunityBookableOutsideValidFromBeforeStartDate](https://openactive.io/test-interface#TestOpportunityBookableOutsideValidFromBeforeStartDate) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |
| [unknown-endpoint](./implemented/unknown-endpoint-test.js) | Expect an UnknownOrIncorrectEndpointError for requests to unknown endpoints | Send a request to an endpoint that does not exist, and expect an UnknownOrIncorrectEndpointError to be returned |  |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
