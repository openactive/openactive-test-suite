[< Return to Overview](../../README.md)
# Proposal Amendment - Amend an opportunity using an OrderProposal (proposal-amendment)

Test approval flows with Proposal Amendment.


https://openactive.io/open-booking-api/EditorsDraft/#proposal-amendment

Coverage Status: **complete**

See also: 
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableWithNegotiation](https://openactive.io/test-interface#TestOpportunityBookableWithNegotiation) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/approval/proposal-amendment/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "proposal-amendment": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [proposal-amendment-book](./implemented/proposal-amendment-book-test.js) | Successful booking using the Booking Flow with Approval, creating an amendment | A successful end to end booking, via Booking Flow with Approval, of an opportunity, creating an amendment. | [TestOpportunityBookableWithNegotiation](https://openactive.io/test-interface#TestOpportunityBookableWithNegotiation) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


