[< Return to Overview](../../README.md)
# Minimal Proposal Implementation - Book an opportunity using a Proposal (minimal-proposal)

Test Minimal Proposal Implementation approval flows. Proposal Amendments are not included here.


https://openactive.io/open-booking-api/EditorsDraft/#minimal-proposal-implementation

Coverage Status: **partial**

See also: 
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableFlowRequirementOnlyApproval](https://openactive.io/test-interface#TestOpportunityBookableFlowRequirementOnlyApproval) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/approval/minimal-proposal/
```



## 'Implemented' tests

This feature is **required** by the Open Booking API specification, and so must always be set to `true` by `default.json` within `packages/openactive-integration-tests/config/`:

```json
"implementedFeatures": {
  ...
  "minimal-proposal": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [successful-book](./implemented/successful-book-test.js) | Successful booking using the Booking Flow with Approval | A successful end to end booking, via Booking Flow with Approval, of an opportunity. | [TestOpportunityBookableFlowRequirementOnlyApproval](https://openactive.io/test-interface#TestOpportunityBookableFlowRequirementOnlyApproval) x3, [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x1 |


