[< Return to Overview](../../README.md)
# termsOfService without requiresExplicitConsent (terms-of-service-for-seller)

Displaying terms of service of the Seller, without requiring consent


https://www.openactive.io/open-booking-api/EditorsDraft/#delivery-of-terms-and-conditions-and-privacy-policy

Coverage Status: **complete**
### Test prerequisites - Opportunities
Opportunities that match the following criteria must exist in the booking system (for each configured `bookableOpportunityTypesInScope`) for the configured primary Seller in order to use `useRandomOpportunities: true`. Alternatively the following `testOpportunityCriteria` values must be supported by the [test interface](https://openactive.io/test-interface/) of the booking system for `useRandomOpportunities: false`.

[TestOpportunityBookableSellerTermsOfService](https://openactive.io/test-interface#TestOpportunityBookableSellerTermsOfService) x4



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/terms/terms-of-service-for-seller/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "terms-of-service-for-seller": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [seller-terms-of-service](./implemented/seller-terms-of-service-test.js) | Terms of service defined by seller in opportunity feed, C1, C2 and B | Terms of service defined by seller reflected in seller fields in opportunity feed, C1, C2 and B | [TestOpportunityBookableSellerTermsOfService](https://openactive.io/test-interface#TestOpportunityBookableSellerTermsOfService) x4 |  |


