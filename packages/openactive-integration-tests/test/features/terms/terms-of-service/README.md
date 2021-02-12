[< Return to Overview](../../README.md)
# termsOfService without requiresExplicitConsent (terms-of-service)

Displaying terms of service, without requiring consent


https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy

Coverage Status: **none**
### Test prerequisites
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4, [TestOpportunityBookableSellerTermsOfService](https://openactive.io/test-interface#TestOpportunityBookableSellerTermsOfService) x4

*Note the test coverage for this feature is currently nonexistent. The test suite does not yet include non-stubbed tests for this feature.*


## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "terms-of-service": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [booking-system-terms-of-service](./implemented/booking-system-terms-of-service-test.js) | Terms of service defined by bookingService in  C1, C2 and B | Terms of service defined by bookingService reflected in bookingService fields in  C1, C2 and B | [TestOpportunityBookable](https://openactive.io/test-interface#TestOpportunityBookable) x4 |
| [seller-terms-of-service](./implemented/seller-terms-of-service-test.js) | Terms of service defined by seller in opportunity feed, C1, C2 and B | Terms of service defined by seller reflected in seller fields in opportunity feed, C1, C2 and B | [TestOpportunityBookableSellerTermsOfService](https://openactive.io/test-interface#TestOpportunityBookableSellerTermsOfService) x4 |


