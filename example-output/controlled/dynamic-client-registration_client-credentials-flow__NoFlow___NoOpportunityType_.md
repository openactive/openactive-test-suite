[< Return to Summary](summary.md) | File Generated: Thu Jul 01 2021 18:58:13 GMT+0000 (Coordinated Universal Time)

# dynamic-client-registration >> client-credentials-flow

**Booking Flow:** 

**Opportunity Type:** 

**Feature:** Authentication / Dynamic Client Registration for Multiple Seller Systems (Implemented) 

**Test:**  Client Credentials Flow and Access Orders Feed

...

### Running only this test

```bash
npm start -- --runInBand test/features/authentication/dynamic-client-registration/implemented/client-credentials-flow-test.js
```

---

✅ 3 passed with 0 failures, 0 warnings and 0 suggestions 

---


## Open ID Connect Authentication

### Credentials


The test suite is using Dynamic Client Registration to retrieve credentials as part of this test, using the following configuration within `bookingPartnersForSpecificTests.dynamicSecondary.authentication`:
* **initialAccessToken**: `dynamic-secondary-a21518cb57af7b6052df`

Hence the `client_id` and `client_secret` can be found within the Dynamic Client Registration response below.

      

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

### Dynamic Client Registration Request
POST https://localhost:5003/connect/register

* **authorization:** `"Bearer dynamic-secondary-a21518cb57af7b6052df"`
* **accept:** `"application/json"`
* **content-type:** `"application/json"`
* **content-length:** `"413"`
* **accept-encoding:** `"gzip, deflate, br"`
* **host:** `"localhost:5003"`

```json
{
  "redirect_uris": [
    "http://localhost:3000/cb"
  ],
  "grant_types": [
    "authorization_code",
    "refresh_token",
    "client_credentials"
  ],
  "client_name": "OpenActive Test Suite Client",
  "client_uri": "https://github.com/openactive/openactive-test-suite",
  "logo_uri": "https://via.placeholder.com/512x256.png?text=Logo",
  "scope": "openid profile openactive-openbooking openactive-ordersfeed oauth-dymamic-client-update openactive-identity"
}
```

---
Response status code: 201.
```json
{
  "client_id": "b837857e-0cdf-4e5f-b254-9ef4d2a8a683",
  "client_secret": "oIgAd2K9gh5e86nEqPShIHYk6vBPfRA6smsFN9uEIJY",
  "client_name": "OpenActive Test Suite Client",
  "client_uri": "https://github.com/openactive/openactive-test-suite",
  "initiate_login_uri": null,
  "logo_uri": "https://via.placeholder.com/512x256.png?text=Logo",
  "grant_types": [
    "authorization_code",
    "refresh_token",
    "client_credentials"
  ],
  "redirect_uris": [
    "http://localhost:3000/cb"
  ],
  "scope": "openid profile openactive-openbooking openactive-ordersfeed oauth-dymamic-client-update openactive-identity"
}
```

### Client Credentials Flow Request
POST https://localhost:5003/connect/token

* **authorization:** `"Basic YjgzNzg1N2UtMGNkZi00ZTVmLWIyNTQtOWVmNGQyYThhNjgzOm9JZ0FkMks5Z2g1ZTg2bkVxUFNoSUhZazZ2QlBmUkE2c21zRk45dUVJSlk="`
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
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6InJrWWlDeV9OWkVDemJ5TGpyUGFTZkEiLCJ0eXAiOiJhdCtqd3QifQ.eyJuYmYiOjE2MjUxNjU4OTQsImV4cCI6MTYyNTE2OTQ5NCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMyIsImF1ZCI6Im9wZW5ib29raW5nIiwiY2xpZW50X2lkIjoiYjgzNzg1N2UtMGNkZi00ZTVmLWIyNTQtOWVmNGQyYThhNjgzIiwiaHR0cHM6Ly9vcGVuYWN0aXZlLmlvL2NsaWVudElkIjoiYjgzNzg1N2UtMGNkZi00ZTVmLWIyNTQtOWVmNGQyYThhNjgzIiwic2NvcGUiOlsib3BlbmFjdGl2ZS1vcmRlcnNmZWVkIl19.lQAFRHKA6L2jRpTIJTzaD1rvd11YA7_waJQU9Z41MH1KoLhM1a6qLLCtXLLelipP5HraNaDgIIo2dfxiex--9ctXcyYoF5G6YJeGey2ntswL428ChUAZy5jqMfJYQ5Ousv7E-rZDhf1_Dhkxice_fdqDk4QGVoKa2M-pX0daIEyckIlz0PKg9QON9MhWrgEYtYCP0-ADkB85j-47--pLbqLehK69NzIIgvI581D65jkGObgqMzEntL4OC7OsLYQRdg4BjE2XO-MqSMJBc7fpdpd6hJYFgBvmK7zKEJEJvPwvXC1sJh3kBcoT5L9uHNWLg1_UD4DmEMDgKBN34-jF4g",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "openactive-ordersfeed"
}
```
### Specs
* ✅ should complete Discovery successfully
* ✅ should complete Dynamic Client Registration successfully
* ✅ should complete Client Credentials Flow successfully


