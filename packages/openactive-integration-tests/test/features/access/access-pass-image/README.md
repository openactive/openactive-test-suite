[< Return to Overview](../../README.md)
# accessPass - Seller provided access control images  (access-pass-image)

Support for accessPass provided by the Seller, in the form of an image


https://www.openactive.io/open-booking-api/EditorsDraft/#image-based-access-control

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "access-pass-image": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [access-pass-image](./implemented/access-pass-image-test.js) | Successful booking with access pass image. | Access pass image returned for B request. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


