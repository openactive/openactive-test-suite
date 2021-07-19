[< Return to Overview](../../README.md)
# Dynamic Client Registration for Multiple Seller Systems (dynamic-client-registration)

For multi-database booking systems where the customer manages Open Booking API client credentials.


https://www.openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems

Coverage Status: **complete**



### Running tests for only this feature

```bash
npm start -- --runInBand test/features/authentication/dynamic-client-registration/
```



## 'Implemented' tests

Update `default.json` within `packages/openactive-integration-tests/config/` as follows to enable 'Implemented' testing for this feature:

```json
"implementedFeatures": {
  ...
  "dynamic-client-registration": true,
  ...
}
```

| Identifier | Name | Description | Prerequisites per Opportunity Type |
|------------|------|-------------|---------------|
| [authorization-code-flow](./implemented/authorization-code-flow-test.js) | Authorization Code Flow | The Authorization Code Flow allows Sellers to authenticate with Booking Partners |  |
| [client-credentials-flow](./implemented/client-credentials-flow-test.js) | Client Credentials Flow and Access Orders Feed | ... |  |


