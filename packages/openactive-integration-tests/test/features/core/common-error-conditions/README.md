[< Return to Overview](../../README.md)
# Common error conditions (common-error-conditions)

Tests C1, C2 and B for common error conditions applicable to all implementations


https://openactive.io/open-booking-api/EditorsDraft/#error-model

Coverage Status: **partial**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[_TestOpportunityDoesNotExist](https://openactive.io/test-interface#_TestOpportunityDoesNotExist) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


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
| [unknown-opportunity](./implemented/unknown-opportunity-test.js) | Expect an UnknownOpportunityDetailsError for an non-existent Opportunity | Runs C1, C2 and B for an non-existent opportunity (with fictional identifiers), expecting an UnknownOpportunityDetailsError error to be returned | [_TestOpportunityDoesNotExist](https://openactive.io/test-interface#_TestOpportunityDoesNotExist) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |



## 'Not Implemented' tests


| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [feature-required-noop](./not-implemented/feature-required-noop-test.js) | Feature required | This feature is required by the specification and must be implemented. |  |
