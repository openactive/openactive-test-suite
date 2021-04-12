# OpenActive Test Suite [![Reference Implementation](https://github.com/openactive/openactive-test-suite/workflows/Reference%20Implementation/badge.svg)](https://github.com/openactive/openactive-test-suite/actions?query=branch%3Amaster+workflow%3A%22Reference+Implementation%22)

To join the conversation, we're on the [OpenActive Slack](https://slack.openactive.io/) at #openactive-test-suite.

The general aim of this project is to allow end to end testing of the various flows and failure states of the Open Booking API.

Running `npm start` in the root will run the OpenActive Test Suite, which is actually comprised of three packages:
* [OpenID Test Client](./packages/openactive-openid-test-client): this connects to the target Open Booking API's OpenID Provider. This allows the Broker and Integration tests to authorize with the implementation
* [Broker Microservice](./packages/openactive-broker-microservice/): this sits in between the test suite and the target Open Booking API implementation. This allows the integration tests to watch for changes to the various RPDE feeds.
* [Integration Tests](./packages/openactive-integration-tests): this performs automated tests against the API.

# Usage

Running `npm start` will orchestrate running the [OpenID Test Client](./packages/openactive-openid-test-client/), [Broker Microservice](./packages/openactive-broker-microservice/) and the [Integration Tests](./packages/openactive-integration-tests/) in order to test your Open Booking API implementation.

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

The test suite uses the file `config/{NODE_ENV}.json` to override the settings in `default.json`. It is recommended that for development and deployment a such a new file is created instead of making changes to the `default.json` file, so that any new required settings that are added in future versions can be automatically updated in `default.json`.

For more information see this [documentation](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_env).

## Installation

Node.js version 14 or above is required.

```bash
npm install
```
 
This will install the dependencies needed for all packages in the test suite.

For developers that are customising the installation, for use in e.g. Docker, the directory `./packages/test-interface-criteria` is a dependency, and so must be present during `npm install`.

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

Note that running `npm start` in the root `openactive-test-suite` directory will override [`waitForHarvestCompletion`](https://github.com/openactive/openactive-test-suite/tree/feature/project-start-script/packages/openactive-broker-microservice#waitforharvestcompletion) to `true` in `default.json`, so that the `openactive-integration-tests` will wait for the `openactive-broker-microservice` to be ready before it begins the test run.

## Test Data Requirements

In order to run the tests in random mode, the target Open Booking API implementation will need to have some Opportunity data pre-loaded. Use [Test Data Generator](./packages/openactive-integration-tests/test-data-generator/) to find out how much data is needed and in what configuration.

# Contributing

- [Contributing to the project](./CONTRIBUTING.md)
