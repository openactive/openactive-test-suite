[< Return to Overview](../../README.md)
# Additional Details capture (additional-details-capture)

Support for capturing additional details 


https://www.openactive.io/open-booking-api/EditorsDraft/#additional-details-capture

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x12


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/details-capture/additional-details-capture/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "additional-details-capture": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [additional-details-required-and-supplied](./implemented/additional-details-required-and-supplied-test.js) | Booking opportunity with additional details supplied and included | Should pass | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [additional-details-required-but-not-supplied](./implemented/additional-details-required-but-not-supplied-test.js) | Booking opportunity with additional details supplied but not included | Should error | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [additional-details-required-invalid-details-supplied](./implemented/additional-details-required-invalid-details-supplied-test.js) | Booking opportunity with additional details supplied but not included | Should error | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


