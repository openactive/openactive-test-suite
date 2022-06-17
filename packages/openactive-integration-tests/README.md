# openactive-integration-tests

This Node.js script runs tests against the specified openactive-broker-microservice instance

## Test coverage

See [Feature Test Coverage](./test/features/README.md) for full details.

## Model results
The results of this test suite when run against the reference implementation can be found:
- [Output when `"useRandomOpportunities": true`](https://openactive.io/openactive-test-suite/example-output/random/summary)
- [Output when `"useRandomOpportunities": false`](https://openactive.io/openactive-test-suite/example-output/controlled/summary)

## Usage in separate terminal windows

To run `openactive-integration-tests` in separate terminal window to `openactive-broker-microservice`, from repository root:

1. Ensure the [openactive-broker-microservice](../openactive-broker-microservice/) is running in another terminal window
2. `export NODE_ENV=dev`
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

### `bookingFlowsInScope`

Like `bookableOpportunityTypesInScope`, tests will be repeated for each of the Booking Flows that are set to `true`.

```json
  "bookingFlowsInScope": {
    "OpenBookingSimpleFlow": true,
    "OpenBookingApprovalFlow": false
  }
```

The different Booking Flows represent the order of API endpoints (and actions) that must be invoked in order to complete a booking. They are:

* `OpenBookingSimpleFlow`: [Simple Booking Flow](https://openactive.io/open-booking-api/EditorsDraft/#simple-booking-flow)
* `OpenBookingApprovalFlow`: [Booking Flow with Approval](https://openactive.io/open-booking-api/EditorsDraft/#booking-flow-with-approval)

This combination of Booking Flows also stacks up with the combination of Opportunity Types:

```json
  "bookableOpportunityTypesInScope": {
    "ScheduledSession": true,
    "FacilityUseSlot": true
  },
  "bookingFlowsInScope": {
    "OpenBookingSimpleFlow": true,
    "OpenBookingApprovalFlow": true
  }
```

In the example above, all of the implemented features would be tested 4 times. Once for ScheduledSessions with the Simple Booking Flow, once for ScheduledSessions with the Approval Flow, etc.

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


## Configuration for `sellers` within `./config/{NODE_ENV}.json`

The `primary` Seller is used for all tests, and random opportunities used when `"useRandomOpportunities": true` are selected from this Seller. The `secondary` Seller is used only for [multiple-sellers](./test/features/core/multiple-sellers/README.md) tests.

An example, using OpenID Connect Authentication:

```json
  "sellers": {
    "primary": {
      "@type": "Organization",
      "@id": "https://reference-implementation.openactive.io/api/identifiers/sellers/0",
      "authentication": {
        "loginCredentials": {
          "username": "test1",
          "password": "test1"
        }
      },
      "taxMode": "https://openactive.io/TaxGross",
      "paymentReconciliationDetails": {
        "name": "AcmeBroker Points",
        "accountId": "SN1593",
        "paymentProviderId": "STRIPE"
      }
    },
    "secondary": {
      "@type": "Person",
      "@id": "https://reference-implementation.openactive.io/api/identifiers/sellers/1",
      "authentication": {
        "loginCredentials": {
          "username": "test2",
          "password": "test2"
        }
      },
      "taxMode": "https://openactive.io/TaxNet"
    }
  }
```

Description of each field:

* `authentication`: Check out the **Configuration for Seller Authentication** section.
* `taxMode`: Which [Tax Mode](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#tax-mode) is used for this Seller.

  **Note: If testing both Tax Modes, make sure that there is at least one Seller with each**. Alternatively, if not supporting multiple Sellers, you can run the Test Suite once with `"taxMode": "https://openactive.io/TaxNet"` and once with `"taxMode": "https://openactive.io/TaxGross"`.
* `paymentReconciliationDetails`: If testing [Payment Reconciliation Detail Validation](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#payment-reconciliation-detail-validation), include the required payment reconciliation details here.

### Configuration for Seller Authentication

In order to make bookings for a specific Seller's Opportunity data, some kind of authentication is required to ensure that the caller is authorized to make bookings for that Seller.

Test Suite allows for a few different options for Seller Authentication. This determines the data to put in the `authentication` field for each Seller:

**OpenID Connect**

[View Spec](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#openid-connect-booking-partner-authentication-for-multiple-seller-systems)

You'll need the username/password that the Seller can use to log in to your OpenID Connect Provider.

Example:

```json
  "sellers": {
    "primary": {
      // ...
      "authentication": {
        "loginCredentials": {
          "username": "test1",
          "password": "test1"
        }
      }
    },
```

**Request Headers**

Just a set of request HTTP headers which will be used to make booking requests.

Example:

```json
  "sellers": {
    "primary": {
      // ...
      "authentication": {
        "loginCredentials": null,
        "requestHeaders": {
          "X-OpenActive-Test-Client-Id": "booking-partner-1",
          "X-OpenActive-Test-Seller-Id": "https://localhost:5001/api/identifiers/sellers/1"
        }
      }
    },
```

## Reading test results

To read the markdown files that are written to the directory specified by `outputPath`, the [Markdown Viewer Chrome Extension](https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk) is recommended, with the following settings:
- CONTENT -> "autoreload" on
- ADVANCED OPTIONS -> ALLOW ACCESS TO FILE:// URLS (links to setting in Chrome Extensions settings of the same name)

Use Ctrl+F within the browser and search for "❌️" to jump to the first error on the page, both within the summary.md file, and within the individual test results linked from the summary.

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
