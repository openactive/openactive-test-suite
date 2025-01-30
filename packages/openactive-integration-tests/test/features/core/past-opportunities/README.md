[< Return to Overview](../../README.md)
# Past opportunities (past-opportunities)

For booking systems that support opportunities in the past, ensure that these are not bookable


https://openactive.io/open-booking-api/EditorsDraft/#error-model

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableInPast](https://openactive.io/test-interface#TestOpportunityBookableInPast) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/core/past-opportunities/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "past-opportunities": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [opportunity-in-past](./implemented/opportunity-in-past-test.js) | Expect an OpportunityOfferPairNotBookableError when opportunity is in the past | Runs C1, C2 and B for an opportunity in the past, expecting an OpportunityOfferPairNotBookableError to be returned at C1, C2, and B | [TestOpportunityBookableInPast](https://openactive.io/test-interface#TestOpportunityBookableInPast) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |  |



## 'Not Implemented' tests


Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Not Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "past-opportunities": false,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [no-past-opportunities](./not-implemented/no-past-opportunities-test.js) | The open data feeds must not contain any opportunities with `startDate` in the past | Assert that no opportunities that match criteria 'TestOpportunityBookableInPast' are available in the opportunity feeds. |  |  |
