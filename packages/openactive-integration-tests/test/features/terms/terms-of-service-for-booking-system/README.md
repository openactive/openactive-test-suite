[< Return to Overview](../../README.md)
# termsOfService without requiresExplicitConsent (terms-of-service-for-booking-system)

Displaying terms of service of the Booking System, without requiring consent


https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy

Coverage Status: **complete**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4


### Running tests for only this feature

```bash
npm start -- --runInBand test/features/terms/terms-of-service-for-booking-system/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "terms-of-service-for-booking-system": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [booking-system-terms-of-service](./implemented/booking-system-terms-of-service-test.js) | Terms of service defined by bookingService in  C1, C2 and B | Terms of service defined by bookingService reflected in bookingService fields in  C1, C2 and B | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |


