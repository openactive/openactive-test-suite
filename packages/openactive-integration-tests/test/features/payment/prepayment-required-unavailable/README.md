[< Return to Overview](../../README.md)
# prepayment required and unavailable (prepayment-required-unavailable)

Support for bookings with prepayment required and bookings with prepayment unavailable

This feature must be implemented if prepayment-required and prepayment-unavailable are both required.

https://www.openactive.io/open-booking-api/EditorsDraft/#booking-without-payment

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x1, [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/payment/prepayment-required-unavailable/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-required-unavailable": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [prepayment-required-unavailable-conflict-error](./implemented/prepayment-required-unavailable-conflict-error-test.js) | Fail when required and unavailable OrderItems are mixed | For an Order that includes OrderItems with openBookingPrepayment=Required and =Unavailable, a OpportunityIsInConflictError should be emitted | [TestOpportunityBookableNonFreePrepaymentRequired](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentRequired) x1, [TestOpportunityBookableNonFreePrepaymentUnavailable](https://openactive.io/test-interface#TestOpportunityBookableNonFreePrepaymentUnavailable) x1 |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "prepayment-required-unavailable": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [prepayment-required-unavailable-not-in-use](./not-implemented/prepayment-required-unavailable-not-in-use-test.js) | Must be implemented if other features are | This feature must be implemented if features: 'prepayment-required' and 'prepayment-unavailable' are implemented |  |
