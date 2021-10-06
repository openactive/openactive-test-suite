[< Return to Overview](../../README.md)
# Anonymous leasing, including leaseExpires (anonymous-leasing)

Leasing at C1, reserving a space in the opportunity before the Customer has provided their contact information


https://www.openactive.io/open-booking-api/EditorsDraft/#leasing

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFiveSpaces](https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces) x1, [TestOpportunityBookableOneSpace](https://openactive.io/test-interface#TestOpportunityBookableOneSpace) x2, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/leasing/anonymous-leasing/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "anonymous-leasing": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [lease-opportunity-multiple-capacity-update](./implemented/lease-opportunity-multiple-capacity-update-test.js) | Multiple anonymous leased spaces are unavailable for purchase by other users | For an opportunity with 2 spaces: Check the opportunity has 2 spaces in the feed. Run C1 to book one item (creating an anonymous lease). Check the opportunity has 1 space in the feed. Run C1 again for a new Order UUID for the same opportunity attempting to book 3 spaces, expecting OrderItems to be returned with 1 having no errors, 1 having an OpportunityCapacityIsReservedByLeaseError, and 1 having an OpportunityHasInsufficientCapacityError. | [TestOpportunityBookableFiveSpaces](https://openactive.io/test-interface#TestOpportunityBookableFiveSpaces) x1 |
| [lease-opportunity-unit-capacity-update](./implemented/lease-opportunity-unit-capacity-update-test.js) | Single anonymous leased spaces are unavailable for purchase by other users | For an opportunity with 1 spaces: Check the opportunity has 1 spaces in the feed. Run C1 to book one item (creating an anonymous lease). Check the opportunity has 0 space in the feed. Run C1 again for a new Order UUID for the same opportunity attempting to book 1 space, expecting OrderItems to be returned having an OpportunityCapacityIsReservedByLeaseError. | [TestOpportunityBookableOneSpace](https://openactive.io/test-interface#TestOpportunityBookableOneSpace) x2 |
| [lease-response](./implemented/lease-response-test.js) | Response at C2 includes a "lease" with a "leaseExpires" in the future | Named lease returned at C2 reserves the OrderItems for a specified length of time | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


