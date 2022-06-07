[< Return to Overview](../../README.md)
# Seller Requested Replacement (seller-requested-replacement)

Replacement triggered by the Seller through the Booking System


https://www.openactive.io/open-booking-api/EditorsDraft/#cancellation-replacement-refund-calculation-and-notification

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/cancellation/seller-requested-replacement/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "seller-requested-replacement": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [book-and-seller-replace-items](./implemented/book-and-seller-replace-items-test.js) | Book and seller replaces order items. | A successful replacement of order items by seller. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


