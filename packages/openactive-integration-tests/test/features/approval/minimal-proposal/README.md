[< Return to Overview](../../README.md)
# Minimal Proposal Implementation - Book an opportunity using an OrderProposal (minimal-proposal)

Test Minimal Proposal Implementation approval flows. OrderProposal Amendments are not included here.


https://openactive.io/open-booking-api/EditorsDraft/#minimal-proposal-implementation

Coverage Status: **complete**

See also: 
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x16


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/approval/minimal-proposal/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "minimal-proposal": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [accept-proposal-book](./implemented/accept-proposal-book-test.js) | Successful booking using the Booking Flow with Approval | A successful end to end booking, via Booking Flow with Approval, of an opportunity. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [customer-reject-proposal](./implemented/customer-reject-proposal-test.js) | OrderProposal rejected by the Customer | An OrderProposal that is rejected by the Customer, and the call to B subsequently fails | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [not-accept-proposal-book](./implemented/not-accept-proposal-book-test.js) | OrderProposal not yet accepted by the Seller | An OrderProposal that is not yet accepted by the Seller, and the call to B subsequently fails | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [seller-reject-proposal](./implemented/seller-reject-proposal-test.js) | OrderProposal rejected by the Seller | An OrderProposal that is rejected by the Seller, and the call to B subsequently fails | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


