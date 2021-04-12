[< Return to Overview](../../README.md)
# Amending the OrderQuote before B (amending-order-quote)

Allows the basket to be updated for a particular order


https://www.openactive.io/open-booking-api/EditorsDraft/#amending-the-orderquote-before-b

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x32


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/amending-order-quote/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "amending-order-quote": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [amend-c1-and-c2](./implemented/amend-c1-and-c2-test.js) | Amend, at C1 and C2, an existing OrderQuote | Run C1,C2 with X opportunities, then - with the same Order UUID - run C1,C2 with Y opportunities, then runs B. The resulting Order should include confirmed bookings for only Y opportunities | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8 |
| [amend-c1](./implemented/amend-c1-test.js) | Amend, at C1, an existing OrderQuote | Run C1 with X opportunities, then - with the same Order UUID - run C1 with Y opportunities. Then, run B. The resulting Order should include confirmed bookings for only Y opportunities | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8 |
| [amend-c2](./implemented/amend-c2-test.js) | Amend, at C2, an existing OrderQuote | Run C1,C2 with X opportunities, then - with the same Order UUID - run C2 with Y opportunities, then runs B. The resulting Order should include confirmed bookings for only Y opportunities | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8 |
| [c2-with-different-details](./implemented/c2-with-different-details-test.js) | Run C2 with different details from C1 | Run C1 with X opportunities, then - with the same Order UUID - run C2 with Y opportunities, then run B. The resulting Order should include confirmed bookings for only Y opportunities | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x8 |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
