# openactive-openid-test-client

This Node.js microservice provides a service that acts as an OpenID Connect Client. It caches tokens retrieved to allow them to be reused across tests, as well as providing endpoints that exercise a target OpenID Connect Server implementation according to the specific OpenID Connect profile defined within the Open Booking API.

## Usage
1. `npm install`
2. `npm start`

## Command-line usage
The test client can be run stand-alone, to aid debugging of an OpenID Connect implementation.

`npm start -- --seller https://www.example.com/seller`

## Configuration

The `./config/default.json` file configures access to the Open Booking API.

### `datasetSiteUrl`

The URL of the IdentityServer of the booking system under test. This dataset site is used to retrieve credentials that are used by the tests within the test suite.

```json
  "identityServerUrl": "https://openactive-reference-implementation.azurewebsites.net/",
```
