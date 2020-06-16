# openactive-broker-microservice

This Node.js microservice provides a service to harvest data and proxy calls to an Open Booking API

## Usage
1. `npm install`
2. `npm start`

## Configuration

The `./config/default.json` file configures access to the Open Booking API.

### `datasetSiteUrl`

The URL of the dataset site of the booking system under test. This dataset site is used to configure the test suite.

```json
  "datasetSiteUrl": "https://bookingsystemreferenceimplementation.azurewebsites.net/openactive",
```

Please note the JSON within the dataset site must include the dataset site [Open Booking API extension](https://github.com/openactive/dataset-api-discovery/issues/2), as follows:

```json
"accessService": {
    "@type": "WebAPI",
    "name": "Open Booking API",
    "description": "API that allows for seamless booking experiences to be created for sessions and facilities available from Better",
    "conformsTo": [
      "https://www.openactive.io/open-booking-api/EditorsDraft/"
    ],
    "documentation": "https://developer.openactive.io/go/open-booking-api",
    "endpointDescription": "https://www.openactive.io/open-booking-api/EditorsDraft/swagger.json",
    "endpointURL": "https://example.bookingsystem.com/api/openbooking/",
    "landingPage": "https://exampleforms.com/get-me-an-api-access-key",
    "termsOfService": "https://example.bookingsystem.com/terms"
  },
```

Note that the `endpointURL` is most important, and must refer to your local Open Booking API [Base URI](https://openactive.io/open-booking-api/EditorsDraft/#dfn-base-uri).

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


### `ordersFeedRequestHeaders`

The headers used when accessing the Orders Feed, useful to configure authentication. Note such authentication [must not be specific to any particular seller](https://openactive.io/open-booking-api/EditorsDraft/#authentication).

```json
  "ordersFeedRequestHeaders": {
    "X-OpenActive-Test-Client-Id": "test"
  }
```
