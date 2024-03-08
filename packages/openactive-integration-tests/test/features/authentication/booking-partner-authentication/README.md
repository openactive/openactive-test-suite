[< Return to Overview](../../README.md)
# Booking Partner Authentication for Multiple Seller Systems (booking-partner-authentication)

OpenID Connect based Booking Partner authentication.


https://www.openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems

Coverage Status: **complete**



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/authentication/booking-partner-authentication/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "booking-partner-authentication": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [authentication-authority-present](./implemented/authentication-authority-present-test.js) | authenticationAuthority present in dataset site | The authenticationAuthority must be specified within the dataset site to facilitate Open ID Connect authentication |  |
| [authorization-code-flow](./implemented/authorization-code-flow-test.js) | Authorization Code Flow | The Authorization Code Flow allows Sellers to authenticate with Booking Partners |  |
| [authorization-persisted](./implemented/authorization-persisted-test.js) | Authorization persists when not requesting offline access | When authorisation is requested without offline access and a user has already given permission, consent must not be required. |  |
| [client-credentials-flow](./implemented/client-credentials-flow-test.js) | Client Credentials Flow | Client Credentials Flow allows Booking Partners to access the Orders Feed |  |


