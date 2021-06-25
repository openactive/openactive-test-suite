[< Return to Overview](../../README.md)
# Booking Partner OpenID Authentication for Multiple Seller Systems (booking-partner-openid-authentication-for-multiple-sellers)

Booking Partner Authentication, using OpenID Connect, for Multiple Seller Systems


https://www.openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems

Coverage Status: **complete**



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/authentication/booking-partner-openid-authentication-for-multiple-sellers/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "booking-partner-openid-authentication-for-multiple-sellers": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [authorization-code-flow](./implemented/authorization-code-flow-test.js) | Authorization Code Flow and Book | The Authorization Code Flow allows Sellers to authenticate with Booking Partners |  |
| [authorization-persisted](./implemented/authorization-persisted-test.js) | Authorization persists when not requesting offline access | When authorisation is requested without offline access and a user has already given permission, consent must not be required. |  |
| [required-features](./implemented/required-features-test.js) | Can only be implemented if other features are | This feature can only be implemented if features: 'multiple-sellers' and 'booking-partner-openid-authentication' are implemented |  |


