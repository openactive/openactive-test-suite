[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:54:15 GMT+0000 (Coordinated Universal Time)

# booking-partner-authentication >> client-credentials-flow

**Booking Flow:** 

**Opportunity Type:** 

**Feature:** Authentication / Booking Partner Authentication for Multiple Seller Systems (Implemented) 

**Test:**  Client Credentials Flow and Access Orders Feed

...

### Running only this test

```bash
npm start -- --runInBand test/features/authentication/booking-partner-authentication/implemented/client-credentials-flow-test.js
```

---

✅ 2 passed with 0 failures, 0 warnings and 0 suggestions 

---


## Open ID Connect Authentication

### Credentials


The test suite is using the credentials below for this test:
* **clientId**: `eb082855-8707-4b6c-943a-6459ccbeb219`
* **clientSecret**: `11AoPW0NxRZYDSi5yeBRcoTnFJjUuVpyfsSD0JIomlF`

These credentials were retrieved using Dynamic Client Registration by the Broker Microservice upon startup, using the following configuration within `bookingPartners.primary.authentication`:
* **initialAccessToken**: `openactive_test_suite_client_12345xaq`





### Discovery Request
GET https://localhost:5003/.well-known/openid-configuration

* **accept:** `"application/json"`
* **accept-encoding:** `"gzip, deflate, br"`
* **host:** `"localhost:5003"`


---
Response status code: 200.
```json
{
  "issuer": "https://localhost:5003",
  "jwks_uri": "https://localhost:5003/.well-known/openid-configuration/jwks",
  "authorization_endpoint": "https://localhost:5003/connect/authorize",
  "token_endpoint": "https://localhost:5003/connect/token",
  "userinfo_endpoint": "https://localhost:5003/connect/userinfo",
  "end_session_endpoint": "https://localhost:5003/connect/endsession",
  "check_session_iframe": "https://localhost:5003/connect/checksession",
  "revocation_endpoint": "https://localhost:5003/connect/revocation",
  "introspection_endpoint": "https://localhost:5003/connect/introspect",
  "device_authorization_endpoint": "https://localhost:5003/connect/deviceauthorization",
  "frontchannel_logout_supported": true,
  "frontchannel_logout_session_supported": true,
  "backchannel_logout_supported": true,
  "backchannel_logout_session_supported": true,
  "scopes_supported": [
    "openid",
    "profile",
    "openactive-identity",
    "openactive-openbooking",
    "openactive-ordersfeed",
    "offline_access"
  ],
  "claims_supported": [
    "sub",
    "name",
    "family_name",
    "given_name",
    "middle_name",
    "nickname",
    "preferred_username",
    "profile",
    "picture",
    "website",
    "gender",
    "birthdate",
    "zoneinfo",
    "locale",
    "updated_at",
    "https://openactive.io/sellerId",
    "https://openactive.io/sellerName",
    "https://openactive.io/sellerUrl",
    "https://openactive.io/sellerLogo",
    "https://openactive.io/bookingServiceName",
    "https://openactive.io/bookingServiceUrl",
    "https://openactive.io/clientId"
  ],
  "grant_types_supported": [
    "authorization_code",
    "client_credentials",
    "refresh_token",
    "implicit",
    "password",
    "urn:ietf:params:oauth:grant-type:device_code"
  ],
  "response_types_supported": [
    "code",
    "token",
    "id_token",
    "id_token token",
    "code id_token",
    "code token",
    "code id_token token"
  ],
  "response_modes_supported": [
    "form_post",
    "query",
    "fragment"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post"
  ],
  "id_token_signing_alg_values_supported": [
    "RS256"
  ],
  "subject_types_supported": [
    "public"
  ],
  "code_challenge_methods_supported": [
    "plain",
    "S256"
  ],
  "request_parameter_supported": true,
  "registration_endpoint": "https://localhost:5003/connect/register"
}
```

### Client Credentials Flow Request
POST https://localhost:5003/connect/token

* **authorization:** `"Basic ZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5OjExQW9QVzBOeFJaWURTaTV5ZUJSY29UbkZKalV1VnB5ZnNTRDBKSW9tbEY="`
* **accept:** `"application/json"`
* **content-type:** `"application/x-www-form-urlencoded"`
* **content-length:** `"57"`
* **accept-encoding:** `"gzip, deflate, br"`
* **host:** `"localhost:5003"`

```json
"grant_type=client_credentials&scope=openactive-ordersfeed"
```

---
Response status code: 200.
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjU2NTUsImV4cCI6MTYyNTE2OTI1NSwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5IiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiZWIwODI4NTUtODcwNy00YjZjLTk0M2EtNjQ1OWNjYmViMjE5Iiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.RvpJqb1kyyeO6BtBZ1oRXGNWxVXSYdIthkDU_mC_ohKqy6cixisCxEUNrpYsy--cK_aYLJF1OjNJxKi3-sXGFGZxxX0BC65LwnftYFj9GyfPN2FYxsOns9MZEIbGUL2Jldl8XYI4dY35ppSPb4kLjD5YzjriF5z6SVqch6G0cKy7ArK3TdzdtIgvxhGnj1U1nxy7hqbjunfoTSFzd7hWi9Xv3QE_joIc8l6OzhiqTfqUJV9A_vqNpvQ-VYCXOQyEKOlpJPDHUv-rC3fp9xTCM92ost6Dn5c-SYEOtTfgzzvKdNtHNgx1Vcz01k9YLIm5Dgizzu6czrWYv0hzHQBeFQ",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "openactive-ordersfeed"
}
```
### Specs
* ✅ should complete Discovery successfully
* ✅ should complete Client Credentials Flow successfully


