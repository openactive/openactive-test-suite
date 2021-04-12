# openactive-integration-tests

This Node.js script runs tests against the specified openactive-broker-microservice instance

## Test coverage

See [Feature Test Coverage](./test/features/README.md) for full details.

### What this test suite does

* Runs a complete happy-path test for the most basic version of the Simple Booking Flow, including cancellation ([customer-requested-cancellation](./test/features/cancellation/customer-requested-cancellation/README.md))
* Includes smaller subsets of the flow ([availability-check](./test/features/core/availability-check/README.md), [simple-book-free-opportunities](./test/features/core/simple-book-free-opportunities/README.md), [simple-book-with-payment](./test/features/payment/simple-book-with-payment/README.md)), to allow for the happy-path to be built up incrementally, in line with the [.NET tutorial](https://tutorials.openactive.io/open-booking-sdk/quick-start-guide/storebookingengine/day-1-fake-implementation)
* Runs additional tests that cover the dataset site ([dataset-site](./test/features/core/dataset-site/README.md)) and test interface ([test-interface](./test/features/core/test-interface/README.md))

### What this test suite doesn’t do (yet)

* Un-happy path tests that cover error conditions and edge cases (all flows [do not have full coverage](./test/features/README.md#partial-test-coverage)).
* Coverage for any feature outside of the most basic version of Simple Booking Flow (most features have [no test coverage](./test/features/README.md#no-test-coverage)).

## Model results
The results of this test suite when run against the reference implementation can be found:
- [Output when `"useRandomOpportunities": true`](https://openactive.io/openactive-test-suite/example-output/random/summary)
- [Output when `"useRandomOpportunities": false`](https://openactive.io/openactive-test-suite/example-output/controlled/summary)

## Usage

From repository root:

1. `npm install`
2. Ensure the [openactive-broker-microservice](../openactive-broker-microservice/) is running, with  `export NODE_ENV=dev` set
3. `npm run start-tests`

### Running specific tests

`npm start-tests -- test/features/core/availability-check/implemented/availability-confirmed-test.js`

### Running core tests in a single process

`npm start-tests -- --runInBand test/features/core/`

## Configuration for `integrationTests` within `./config/{NODE_ENV}.json`

The `integrationTests` object within the `./config/{NODE_ENV}.json` file of the repository configures which tests are run. This object includes the properties listed below, and should be configured to match the features of the booking system under test.

### `useRandomOpportunities`

- `"useRandomOpportunities": true`: Opportunities that match the [prerequisite criteria for each test](./test/features/README.md) must exist in the booking system for the configured primary Seller. These opportunities will be chosen at random, and used for each test. Note that opportunities are not reused between tests within the same run of the test suite.
- `"useRandomOpportunities": false`: The test interface of the booking system is used to create prerequisite opportunities before each test is run, based on the supplied `testOpportunityCriteria`.

### `requestHeaderLogging`

Set this property to `true` to capture request headers in the markdown logs, which can be useful for debugging authentication.

It is recommended that this property be set to `false` when generating conformance certificates, for security.

### `bookableOpportunityTypesInScope`

Tests will be repeated for each opportunity type that is set to `true`. Multiple OrderItem tests will include a mixture of the opportunity types set to `true`.

```json
  "bookableOpportunityTypesInScope": {
    "ScheduledSession": true,
    "FacilityUseSlot": false,
    "IndividualFacilityUseSlot": false,
    "CourseInstance": false,
    "CourseInstanceSubEvent": false,
    "HeadlineEvent": false,
    "HeadlineEventSubEvent": false,
    "Event": false,
    "OnDemandEvent": false
  },
```

### `implementedFeatures`

The value of each [feature](./test/features/README.md) in the map determines the tests that will be run:

- `true`: Runs the 'Implemented' tests for the feature.
- `false`: Runs the 'Not Implemented' tests for the feature, to confirm that the booking system behaviour is consistent with expectations for when the feature is not implemented.
- `null`: Does not run any tests for this feature, useful for debugging.

```json
  "implementedFeatures": {
    "opportunity-feed": true,
    "dataset-site": true,
    "availability-check": true,
    ...
  }
```

### `testDatasetIdentifier`

This identifier is useful where the test interface implementation is shared between different instances of  `openactive-integration-tests`. It allows any test data that was created with this identifier to be cleared before a new test run begins, without effecting test data created with other identifiers.

This value is passed into the test interface of either the broker microservice (when `"useRandomOpportunities": true`), or of the booking system (when `"useRandomOpportunities": false`).

The value can be any string, such as `uat-ci`, or `alex-dev`.

### `outputPath`

Test results are written to `*.md` within the directory specified by `outputPath` in Markdown format.

## Reading test results

To read the markdown files that are written to the directory specified by `outputPath`, the [Markdown Viewer Chrome Extension](https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk) is recommended, with the following settings:
- CONTENT -> "autoreload" on
- ADVANCED OPTIONS -> ALLOW ACCESS TO FILE:// URLS (links to setting in Chrome Extensions settings of the same name)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for info on how the flow validations are written.

See [ARCHITECTURE.md](ARCHITECTURE.md) for information on the various components and how they tie together.

### Debugging tests

`npm start -- --reporters default`

### Debugging tests in VSCode

In order to debug an individual test using VSCode, so you can place breakpoints, inspect values and step through the code in your editor, add a launch configuration to `.vscode/launch.json` that looks like the following:

```json
{
  "name": "integration-tests - {{ nameOfTest }}",
  "request": "launch",
  "runtimeArgs": [
    "run-script",
    "start-tests",
    "--",
    "--runInBand",
    "{{ pathToTest }}"
  ],
  "runtimeExecutable": "npm",
  "skipFiles": [
    "<node_internals>/**"
  ],
  "type": "node"
},
```

Example values:

- `nameOfTest`: `core/amending-order-quote/amend-c1`
- `pathToTest`: `test/features/core/amending-order-quote/implemented/amend-c1-test.js`
