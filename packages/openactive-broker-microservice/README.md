# openactive-broker-microservice

This Node.js microservice provides a service to harvest data and proxy calls to an Open Booking API

## Usage in separate terminal windows

To run `openactive-broker-microservice` in separate terminal window to `openactive-integration-tests`, from repository root:

1. `npm install`
2. `export NODE_ENV=dev`
3. `npm run start-broker`

## Configuration for `broker` within `./config/{NODE_ENV}.json`

The `broker` object within `./config/{NODE_ENV}.json` file of the repository configures access to the Open Booking API. This object includes the properties listed below.

### `datasetSiteUrl`

The URL of the dataset site of the booking system under test. This dataset site is used to configure the test suite.

```json
  "datasetSiteUrl": "https://reference-implementation.openactive.io/openactive",
```

Please note the JSON within the dataset site must include the dataset site [Open Booking API extension](https://github.com/openactive/dataset-api-discovery/issues/2), as follows:

```json
{
  "@context": "http://schema.org/",
  "@type": "Dataset",
  ...
  "accessService": {
    "@type": "WebAPI",
    "name": "Open Booking API",
    "description": "API that allows for seamless booking experiences to be created for sessions and facilities available from Better",
    "conformsTo": [
      "https://www.openactive.io/open-booking-api/EditorsDraft/"
    ],
    "documentation": "https://developer.openactive.io/go/open-booking-api",
    "endpointDescription": "https://www.openactive.io/open-booking-api/EditorsDraft/swagger.json",
    "endpointUrl": "https://example.bookingsystem.com/api/openbooking/",
    "landingPage": "https://exampleforms.com/get-me-an-api-access-key",
    "termsOfService": "https://example.bookingsystem.com/terms"
  }
}
```

Note that the `endpointUrl` is most important, and must refer to your local Open Booking API [Base URI](https://openactive.io/open-booking-api/EditorsDraft/#dfn-base-uri).

### `requestLogging`

Makes the output in the terminal more verbose. Useful for debugging.

```json
  "requestLogging": false,
```


### `waitForHarvestCompletion`

If `true` will block the `openactive-integration-tests` starting until the last page of each harvested feed is reached. This is useful for continuous integration environments.

```json
  "waitForHarvestCompletion": true,
```

### `loginPagesSelectors`

[CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) which are used to find, in the Booking System's login page the following HTML elements:

* Username text input
* Password text input
* Submit button

```json
  "loginPagesSelectors": {
    "username": "[name='username' i]",
    "password": "[name='password' i]",
    "button": ".btn-primary"
  },
```

These selectors would work for a login page whose HTML looks like:

```html
<input type="text" name="username" placeholder="Username" />
<input type="password" name="password" placeholder="Password" />
<input type="submit" class="btn-primary" value="Submit" />
```

**Context**: For Sellers which use OpenID Connect for authorization, Broker needs to acquire these Sellers' tokens in order to authenticate as each of these Sellers. Broker does this by going through [Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/), loading the Booking System's login page in a headless browser and entering username/password details therein.

### `opportunityFeedRequestHeaders`

For private test environments with opportunity feeds that require authentication, headers may be configured. Note that in order to be considered "OpenActive Enabled" and to conform to the Open Booking API, such headers must not be required in production.

```json
  "opportunityFeedRequestHeaders": {
    "X-Api-Key": "example-api-key"
  }
```

### `datasetDistributionOverride`

For test environments that do not yet include a Dataset Site, data feeds may be manually configured. Note that in order to be considered "OpenActive Enabled" and to conform to the Open Booking API, a Dataset Site must be made available in production.

```json
  "datasetDistributionOverride": [
    {
      "@type": "DataDownload",
      "additionalType": "https://openactive.io/ScheduledSession",
      "contentUrl": "https://api.example.com/feeds/scheduled-sessions"
    },
    {
      "@type": "DataDownload",
      "additionalType": "https://openactive.io/SessionSeries",
      "contentUrl": "https://api.example.com/feeds/session-series"
    }
  ]
```

### `disableBucketAllocation`

When using the Broker Microservice as a tool to check validity of opportunity feeds that contain very large datasets, it can be desirable to limit memory usage by disabling bucket allocation. Note that bucket allocation must be enabled to run [Integration tests](../openactive-integration-tests/).

```json
  "disableBucketAllocation": true,
```

### `disableOrdersFeedHarvesting`

During development it may be desirable to temporarily disable harvesting of the Orders Feed. Note that tests that require the Orders Feed will fail when this is set to `true`.

```json
  "disableOrdersFeedHarvesting": true,
```

### `disableBrokerMicroserviceTimeout`

Opportunities are sorted into test-interface-criteria buckets based on the startDate of the opportunity when it is harvested. The means that the broker microservice must be restarted periodically to ensure its buckets allocation does not get stale. If bucket allocation becomes stale, tests will start to fail randomly.

This property must be set to allow the openactive-broker-microservice to run for more than 1 hour.

```json
  "disableBrokerMicroserviceTimeout": true,
```

### `logAuthConfig`

While debugging authentication it can be useful to log the configuration that the broker microservice is supplying the integration tests to use for authentication.

```json
  "logAuthConfig": true,
```

### `bookingPartners`

Config for [Booking Partners](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-booking-partner) that the Test Suite will use to connect to your Booking System.

Broker uses two Booking Partners, named `primary` and `secondary`.

```json
  "bookingPartners": {
    "primary": {
      "authentication": {
        "initialAccessToken": "openactive_test_suite_client_12345xaq"
      }
    },
    "secondary": {
      "authentication": {
        "clientCredentials": {
          "clientId": "clientid_800",
          "clientSecret": "secret"
        }
      }
    }
  }
```

The `authentication` field can contain one of several different authentication strategies for authenticating as the Booking Partner for Order and Order Proposal RPDE Feed requests. Set only one of these strategies. The different authentication strategies are documented in the below subsections.

#### `bookingPartners[bookingPartnerIdentifier].authentication.ordersFeedRequestHeaders`

Use this authentication strategy when accessing the Orders Feed just requires a fixed set of HTTP Headers (e.g. `X-Api-Key: abcdef`).
These headers are used when accessing the Orders Feed. Note that such authentication [must not be specific to any particular seller](https://openactive.io/open-booking-api/EditorsDraft/#authentication).

```json
  "ordersFeedRequestHeaders": {
    "X-OpenActive-Test-Client-Id": "test"
  }
```

#### `bookingPartners[bookingPartnerIdentifier].authentication.clientCredentials`

Use this authentication strategy when using [Client Credentials Flow](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-client-credentials-flow) for accessing Order feeds.

```json
  "clientCredentials": {
    "clientId": "clientid_800",
    "clientSecret": "secret"
  }
```

#### `bookingPartners[bookingPartnerIdentifier].authentication.initialAccessToken`

Use this authentication strategy when using [Client Credentials Flow](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#dfn-client-credentials-flow) but, rather than using an existing client, Broker will register a new client with your Authorization Server using Dynamic Client Registration. For this, your Authorization Server must support [Dynamic Client Registration](https://openid.net/specs/openid-connect-registration-1_0.html).

`initialAccessToken` is the ["Initial Access Token"](https://openid.net/specs/openid-connect-registration-1_0.html#rfc.section.1.2) which can grant access to your Authorization Server's Client Registration Endpoint.

```json
  "initialAccessToken": "openactive_test_suite_client_12345xaq"
```

## Save Feed Snapshot

This is part of the Feed Snapshot Validation flow (TODO TODO link to consolidated docs in project root).

This command harvests the configured dataset's RPDE feeds and then saves a snapshot.

Example usage:

```sh
NODE_ENV=dev npm run save-feed-snapshot-only
```

## Remove Old Feed Snapshots

This clean-up command removes all but the latest 2 feed snapshots.

Example usage:

```sh
NODE_ENV=dev npm run remove-all-but-last-2-feed-snapshots
```
