# OpenActive Test Suite [![Reference Implementation](https://github.com/openactive/openactive-test-suite/workflows/Reference%20Implementation/badge.svg)](https://github.com/openactive/openactive-test-suite/actions?query=branch%3Amaster+workflow%3A%22Reference+Implementation%22)

To join the conversation, we're on the [OpenActive Slack](https://slack.openactive.io/) at #openactive-test-suite.

The general aim of this project is to allow end to end testing of the various flows and failure states of the Open Booking API.

Running `npm start` in the root will run the OpenActive Test Suite, which is actually comprised of these packages:

* [Integration Tests](./packages/openactive-integration-tests): this performs automated tests against the API.
* [Broker Microservice](./packages/openactive-broker-microservice/): this sits in between the test suite and the target Open Booking API implementation. This allows the integration tests to watch for changes to the various RPDE feeds.
* [OpenID Test Client](./packages/openactive-openid-test-client): this connects to the target Open Booking API's OpenID Provider. This allows the Broker and Integration tests to authorize with the implementation
* [Test Interface Criteria](./packages/test-interface-criteria/): this allows test suite to tailor specific opportunities to specific tests by implementing the [OpenActive Test Interface](https://openactive.io/test-interface/) Criteria.

# Usage

Running `npm start` will orchestrate running the [Broker Microservice](./packages/openactive-broker-microservice/) and the [Integration Tests](./packages/openactive-integration-tests/) in order to test your Open Booking API implementation.

Note that the implementation under test will need to implement the [OpenActive Test Interface](https://openactive.io/test-interface/) to run in controlled mode, and for selected tests.

## Quick start

You can check that the test suite works in your local environment by running it against the hosted [OpenActive Reference Implementation](https://reference-implementation.openactive.io/), simply by using the default configuration:

``` bash
git clone git@github.com:openactive/openactive-test-suite.git
cd openactive-test-suite
npm install
npm start -- core
```

Note that the above command only runs the "core" tests within the test suite, which should take around 60 seconds to complete.

The hosted OpenActive Reference Implementation is running on a basic developer tier Azure instance with a burst quota, so it will not handle the load of a test suite run for all tests (hence `npm start -- core`); if the hosted application shuts down, simply wait 5 minutes and try again.

## Configuration

In order to run the test suite against your own implementation, configure the test suite by creating a copy of [`config/default.json`](./config/default.json) named `config/{NODE_ENV}.json` (where `{NODE_ENV}` is the value of your `NODE_ENV` environment variable), including the following properties:
   - [`broker` microservice configuration](./packages/openactive-broker-microservice/#configuration-for-broker-within-confignode_envjson)
   - [`integrationTests` and `sellers` configuration](./packages/openactive-integration-tests/#configuration-for-integrationtests-within-confignode_envjson)

The test suite uses the file `config/{NODE_ENV}.json` to override the settings in `default.json`. For development and deployment create a new file instead of making changes to the `default.json` file, so that any new required settings that are added in future versions can be automatically updated in `default.json`.

For more information about this use of `NODE_ENV` see this [documentation](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_env).

By convention, much of the documentation assumes you to have created a `config/dev.json` file, which Test Suite will use when env var `NODE_ENV=dev`. But you can use any name you like, and have multiple configuration files for different environments.

### Configuration for `sellers` within `./config/{NODE_ENV}`

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

* `authentication`: Check out the [**Configuration for Seller Authentication**](#configuration-for-seller-authentication) section.
* `taxMode`: Which [Tax Mode](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#tax-mode) is used for this Seller.

  **Note: If testing both Tax Modes, make sure that there is at least one Seller with each**. Alternatively, if not supporting multiple Sellers, you can run the Test Suite once with `"taxMode": "https://openactive.io/TaxNet"` and once with `"taxMode": "https://openactive.io/TaxGross"`. However, it is not currently possible to generate a certificate that covers both configurations unless multiple Sellers are supported.
* `paymentReconciliationDetails`: If testing [Payment Reconciliation Detail Validation](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#payment-reconciliation-detail-validation), include the required payment reconciliation details here.

### Configuration for Seller Authentication

In order to make bookings for a specific Seller's Opportunity data, some kind of authentication is required to ensure that the caller is authorized to make bookings for that Seller.

Test Suite allows for a few different options for Seller Authentication. This determines the data to put in the `authentication` field for each Seller:

#### OpenID Connect

[View Spec](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems)

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

#### Request Headers

Just a set of request HTTP headers which will be used to make booking requests. There are no restrictions on the `requestHeaders` that can be specified.

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

#### Client Credentials

[OAuth Client Credentials](https://oauth.net/2/grant-types/client-credentials/) are used to make booking requests.

Example:

```json
  "sellers": {
    "primary": {
      // ...
      "authentication": {
        "loginCredentials": null,
        "clientCredentials": {
          "clientId": "clientid_XXX",
          "clientSecret": "example"
        }
      }
    },
```

This is different from the behaviour in the Client Credentials sub-section mentioned within the [OpenID Connect Booking Partner Authentication for Multiple Seller Systems](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems) section in the spec as, in this case, Client Credentials are used to make booking requests for this Seller, rather than just to view the Booking Partner's Orders Feed.

### Configuration for `sellers` within `./config/{NODE_ENV}`

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

* `authentication`: Check out the [**Configuration for Seller Authentication**](#configuration-for-seller-authentication) section.
* `taxMode`: Which [Tax Mode](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#tax-mode) is used for this Seller.

  **Note: If testing both Tax Modes, make sure that there is at least one Seller with each**. Alternatively, if not supporting multiple Sellers, you can run the Test Suite once with `"taxMode": "https://openactive.io/TaxNet"` and once with `"taxMode": "https://openactive.io/TaxGross"`.
* `paymentReconciliationDetails`: If testing [Payment Reconciliation Detail Validation](https://openactive.io/open-booking-api/EditorsDraft/1.0CR3/#payment-reconciliation-detail-validation), include the required payment reconciliation details here.

### Configuration for Seller Authentication

In order to make bookings for a specific Seller's Opportunity data, some kind of authentication is required to ensure that the caller is authorized to make bookings for that Seller.

Test Suite allows for a few different options for Seller Authentication. This determines the data to put in the `authentication` field for each Seller:

#### OpenID Connect

[View Spec](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems)

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

In order for Test Suite to be able to log in to your OpenID Connect Provider, you'll need to also configure `broker.loginPagesSelectors` (see [Broker Microservice Configuration](./packages/openactive-broker-microservice/README.md#loginpagesselectors)).

#### Request Headers

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

#### Client Credentials

[OAuth Client Credentials](https://oauth.net/2/grant-types/client-credentials/) are used to make booking requests.

Example:

```json
  "sellers": {
    "primary": {
      // ...
      "authentication": {
        "loginCredentials": null,
        "clientCredentials": {
          "clientId": "clientid_XXX",
          "clientSecret": "example"
        }
      }
    },
```

This is different from the behaviour in the Client Credentials sub-section mentioned within the [OpenID Connect Booking Partner Authentication for Multiple Seller Systems](https://openactive.io/open-booking-api/EditorsDraft/#openid-connect-booking-partner-authentication-for-multiple-seller-systems) section in the spec as, in this case, Client Credentials are used to make booking requests for this Seller, rather than just to view the Booking Partner's Orders Feed.

## Installation

Node.js version 14 or above is required.

```bash
npm install
```
 
This will install the dependencies needed for all packages in the test suite.

For developers that are customising the installation, for use in e.g. Docker, the directories `./packages/test-interface-criteria` and `./packages/openactive-openid-test-client` are dependencies, and so must be present during `npm install`.

## Running

Where `dev.json` is the name of your `{NODE_ENV}.json` configuration file:

```bash
export NODE_ENV=dev
npm start
```

This will start the broker microservice ([`openactive-broker-microservice`](./packages/openactive-broker-microservice/)) and run all integration tests ([`openactive-integration-tests`](./packages/openactive-integration-tests)) according to the [feature configuration](./packages/openactive-integration-tests/#configuration). It will then kill the broker microservice upon test completion. The console output includes both `openactive-broker-microservice` and `openactive-integration-tests`. This is perfect for CI, or simple test runs.

Alternatively the [Broker microservice](./packages/openactive-broker-microservice/) and [Integration tests](./packages/openactive-integration-tests) may be run separately, for example in two different console windows. This is more useful for debugging.

### Running specific tests

Any extra command line arguments will be passed to `jest` in [`openactive-integration-tests`](./packages/openactive-integration-tests). For example: 

```bash
export NODE_ENV=dev
npm start -- --runInBand test/features/core/availability-check/
```

It is also possible to use a [category identifier or feature identifier](./packages/openactive-integration-tests/test/features/README.md) as short-hand:

```bash
export NODE_ENV=dev
npm start -- core
```

```bash
export NODE_ENV=dev
npm start -- availability-check
```

Read about Jest's command line arguments in their [CLI docs](https://jestjs.io/docs/en/cli).


### Environment variables

#### `NODE_CONFIG`

The configuration of the test suite can be overridden with the environment variable `NODE_CONFIG`, where any specified configuration will override values in both `config/default.json`. More detail can be found in the [node-config docs](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config). For example:

  ```bash
  NODE_CONFIG='{ "waitForHarvestCompletion": true, "datasetSiteUrl": "https://localhost:5001/openactive", "sellers": { "primary": { "@type": "Organization", "@id": "https://localhost:5001/api/identifiers/sellers/0", "requestHeaders": { "X-OpenActive-Test-Client-Id": "test", "X-OpenActive-Test-Seller-Id": "https://localhost:5001/api/identifiers/sellers/0" } }, "secondary": { "@type": "Person", "@id": "https://localhost:5001/api/identifiers/sellers/1" } }, "useRandomOpportunities": true, "generateConformanceCertificate": true, "conformanceCertificateId": "https://openactive.io/openactive-test-suite/example-output/random/certification/" }' npm start
  ```

#### `PORT`

Defaults to 3000.

Set `PORT` to override the default port that the `openactive-broker-microservice` will expose endpoints on for the `openactive-integration-tests`. This is useful in the case that you already have a service using port 3000.

#### `FORCE_COLOR`

E.g. `FORCE_COLOR=1`

Set this to force the OpenActive Test Suite to output in colour. The OpenActive Test Suite uses [chalk](https://github.com/chalk/supports-color), which attempts to auto-detect the color support of the terminal. For CI environments this detection is often inaccurate, and `FORCE_COLOR=1` should be set manually.

## Continuous Integration

Assuming configuration is set using the `NODE_CONFIG` environment variable as described above, the test suite can be run within a continuous integration environment, as shown below:

```bash
#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Get the latest OpenActive Test Suite
git clone git@github.com:openactive/openactive-test-suite.git
cd openactive-test-suite

# Install dependencies
npm install

# Start broker microservice and run tests
npm start
```

`"ci": true` must be included in the supplied `NODE_CONFIG` to ensure correct console logging output within a CI environment.

Note that running `npm start` in the root `openactive-test-suite` directory will override [`waitForHarvestCompletion`](https://github.com/openactive/openactive-test-suite/tree/feature/project-start-script/packages/openactive-broker-microservice#waitforharvestcompletion) to `true` in `default.json`, so that the `openactive-integration-tests` will wait for the `openactive-broker-microservice` to be ready before it begins the test run.

## Test Data Requirements

In order to run the tests in random mode, the target Open Booking API implementation will need to have some Opportunity data pre-loaded. Use [Test Data Generator](./packages/openactive-integration-tests/test-data-generator/) to find out how much data is needed and in what configuration.

# Contributing

- [Contributing to the project](./CONTRIBUTING.md)

# Concepts

## Booking Partner Authentication Strategy

The method by which a [Booking Partner](https://openactive.io/open-booking-api/EditorsDraft/#dfn-booking-partner) authenticates with the Open Booking API implementation. There are a number of supported strategies, including OpenID Connect, HTTP Header, etc.

Your impementation will need to support at least one Authentication Strategy for each of [**Orders Feed Authentication**](#orders-feed-authentication) and [**Booking Authentication**](#booking-authentication).

### Orders Feed Authentication

How a Booking Partner accesses the [Orders Feed](https://openactive.io/open-booking-api/EditorsDraft/#dfn-orders-feed) containing updates to Orders that they have created.

For Test Suite, the selected Orders Feed Authentication Strategy is configured with the [`broker.bookingPartners` configuration property](./packages/openactive-broker-microservice/README.md#bookingpartners) and documentation on the supported strategies can be found there.

### Booking Authentication

How a Booking Partner accesses the booking endpoints (C1, C2, B, etc) for a specific Seller's data. This differs from [Orders Feed Authentication](#orders-feed-authentication) as it can be specified at the per-Seller level for Multiple Seller Systems (relevant feature: [`multiple-sellers`](packages/openactive-integration-tests/test/features/core/multiple-sellers/)).

For Test Suite, the selected Booking Authentication Strategy is configured with the [`sellers` configuration property](#configuration-for-seller-authentication) and documentation on the supported strategies can be found there.
