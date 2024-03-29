[< Return to Overview](../../README.md)
# Customer Details identifier capture (customer-details-capture-identifier)

Support for capturing the Broker's identifier for the customer. Note this field cannot be mandatory.


https://www.openactive.io/open-booking-api/EditorsDraft/#schema-person-for-customer-or-attendee

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/details-capture/customer-details-capture-identifier/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-details-capture-identifier": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [customer-identifier-capture](./implemented/customer-identifier-capture-test.js) | Customer identifier is reflected back at C2 and B | Identifier from the Customer supplied by Broker should be reflected back by booking system. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |


