[< Return to Overview](../../README.md)
# Customer Details non-essential capture (customer-details-capture-non-essential)

Support for capturing forename, surname, and telephone number from the Customer. Note these fields cannot be mandatory.


https://www.openactive.io/open-booking-api/EditorsDraft/#customer-details-capture

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/details-capture/customer-details-capture-non-essential/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "customer-details-capture-non-essential": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [non-essential-customer-details-reflected](./implemented/non-essential-customer-details-reflected-test.js) | givenName, familyName, and telephone number are reflected back at C2 and B | Forename, surname, and telephone number from the Customer supplied by Broker should be reflected back by booking system. | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |  |


