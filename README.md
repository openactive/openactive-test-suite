# OpenActive Test Suite [![Reference Implementation](https://github.com/openactive/openactive-test-suite/workflows/Reference%20Implementation/badge.svg)](https://github.com/openactive/openactive-test-suite/actions?query=branch%3Amaster+workflow%3A%22Reference+Implementation%22)

To join the conversation, we're on the [OpenActive Slack](https://slack.openactive.io/) at #openactive-test-suite.

The general aim of this project is to allow end to end testing of the various flows and failure states of the Open Booking API.

This repository hosts three different projects:
* [OpenID Test Client](./packages/openactive-openid-test-client): this connects to the target Open Booking API's OpenID Provider. This allows the Broker and Integration tests to authorize with the implementation
* [Broker Microservice](./packages/openactive-broker-microservice/): this sits in between the test suite and the target Open Booking API implementation. This allows the integration tests to watch for changes to the various RPDE feeds.
* [Integration Tests](./packages/openactive-integration-tests): this performs automated tests against the API.

[The Roadmap](./ROADMAP.md) provides an overview of upcoming development milestones, and contributions are welcome.

# Usage

Briefly, you'll need to run the OpenID Test Client, Broker Microservice and the Integration Tests in order to test your Booking API.

For more info, read the individual README.md within the package directories:
* [OpenID Test Client](./packages/openactive-openid-test-client/)
* [Broker microservice](./packages/openactive-broker-microservice/)
* [Integration tests](./packages/openactive-integration-tests/)

## Configuration
Before running, configure the test suite:
 - `packages/openactive-broker-microservice/config/default.json`
   - [More information](./packages/openactive-broker-microservice/#configuration)
 - `packages/openactive-integration-tests/config/default.json`
   - [More information](./packages/openactive-integration-tests/#configuration)

### Local configuration

A `local.json` file can be placed alongside each `default.json`, and the subset of properties defined within it will override those in `default.json`. It is recommended that for development and deployment a `local.json` file is created instead of making changes to the `default.json` file, so that any new required settings that are added in future versions can be automatically updated in `default.json`.

### Environment specific configuration

A file named `{NODE_ENV}.json` can also be placed alongside the `default.json`, which is useful when maintaining multiple configurations.

For more information see the [documentation](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_env).

## Test Data Requirements

In order to run the tests in random mode, the target Open Booking API implementation will need to have some Opportunity data pre-loaded. Use [Test Data Generator](./packages/openactive-integration-tests/test-data-generator/) to find out how much data is needed and in what configuration.

## Installation
```bash
npm install
```
 
This will install the dependencies needed for both packages.

For developers that are customising the installation, for use in e.g. Docker, the directory `./packages/test-interface-criteria` is a dependency, and so must be present during `npm install`.

## Running

```bash
npm start
```

This will start the broker microservice ([`openactive-broker-microservice`](./packages/openactive-broker-microservice/)) and run all integration tests ([`openactive-integration-tests`](./packages/openactive-integration-tests)) according to the [feature configuration](./packages/openactive-integration-tests/#configuration). It will then kill the broker microservice upon test completion. The console output includes both `openactive-broker-microservice` and `openactive-integration-tests`. This is perfect for CI, or simple test runs.

Alternatively the [Broker microservice](./packages/openactive-broker-microservice/) and [Integration tests](./packages/openactive-integration-tests) may be run separately, for example in two different console windows. This is more useful for debugging.

### Running specific tests

Any extra command line arguments will be passed to `jest` in [`openactive-integration-tests`](./packages/openactive-integration-tests). For example: 

```bash
npm start -- --runInBand test/features/core/availability-check/
```

It is also possible to use a [category identifier or feature identifier](./packages/openactive-integration-tests/test/features/README.md) as short-hand:

```bash
npm start core
```

```bash
npm start availability-check
```

Read about Jest's command line arguments in their [CLI docs](https://jestjs.io/docs/en/cli).


### Environment variables

#### `NODE_CONFIG`

The configuration of the test suite can be overridden with the environment variable `NODE_CONFIG`, where any specified configuration will override values in both `packages\openactive-broker-microservice\config\default.json` and `packages\openactive-integration-tests\config\default.json`. More detail can be found in the [node-config docs](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config). For example:

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

# Contributing

- [Contributing to the project](./CONTRIBUTING.md)
