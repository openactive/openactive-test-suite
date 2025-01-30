[< Return to Overview](../../README.md)
# Booking Partner OpenID Authentication (booking-partner-openid-authentication)

Booking Partner Authentication using OpenID Connect


https://www.openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems

Coverage Status: **complete**




### Running tests for only this feature

```bash
npm start -- --runInBand test/features/authentication/booking-partner-openid-authentication/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "booking-partner-openid-authentication": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type | Required Test Interface Actions |
|------------|------|-------------|---------------|-------------------|
| [authentication-authority-present](./implemented/authentication-authority-present-test.js) | authenticationAuthority present in dataset site | The authenticationAuthority must be specified within the dataset site to facilitate Open ID Connect authentication |  |  |
| [client-credentials-flow](./implemented/client-credentials-flow-test.js) | Client Credentials Flow | Client Credentials Flow allows Booking Partners to access the Orders Feed |  |  |


