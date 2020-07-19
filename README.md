# OpenActive Test Suite [![Reference Implementation](https://github.com/openactive/openactive-test-suite/workflows/Reference%20Implementation/badge.svg)](https://github.com/openactive/openactive-test-suite/actions?query=branch%3Amaster+workflow%3A%22Reference+Implementation%22)

To join the conversation, we're on the [OpenActive Slack](https://slack.openactive.io/) at #openactive-test-suite.

The general aim of this project is to allow end to end testing of the various flows and failure states of the Open Booking API.

This repository hosts two different projects:
* [Broker microservice](./packages/openactive-broker-microservice/): this sits in between the test suite and the target Open Booking API implementation. This allows the test suite to watch for changes, and throws them back to it.
* [Integration tests](./packages/openactive-integration-tests): this performs automated tests against the API

[The Roadmap](./ROADMAP.md) provides an overview of upcoming development milestones, and contributions are welcome.

# Usage

For more info, read the individual README.md within the package directories:
* [Broker microservice](./packages/openactive-broker-microservice/)
* [Integration tests](./packages/openactive-integration-tests/)

## Configuration
Before running, configure the test suite:
 - `packages/openactive-broker-microservice/config/default.json`
   - [More information](./packages/openactive-broker-microservice/#configuration)
 - `packages/openactive-integration-tests/config/test.json`
   - [More information](./packages/openactive-integration-tests/#configuration)

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

This will run the broker microservice and then run all tests against it, according to the [feature configuration](./packages/openactive-integration-tests/#configuration).

### Running specific tests

Any extra command line arguments will be passed to `jest` in `openactive-integration-tests`. For example: 

```bash
npm start --runInBand -- test/features/core/availability-check/
```

Read about Jest's command line arguments in their [CLI docs](https://jestjs.io/docs/en/cli).

### Configuration overrides

The configuration of the test suite can be overridden with the environment variable `NODE_CONFIG`, where any specified configuration will override values in both `packages\openactive-broker-microservice\config\default.json` and `packages\openactive-integration-tests\config\test.json`. More detail can be found in the [node-config docs](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config). For example:

  ```bash
  NODE_CONFIG='{ "waitForHarvestCompletion": true, "datasetSiteUrl": "https://localhost:5001/openactive", "sellers": { "primary": { "@type": "Organization", "@id": "https://localhost:5001/api/identifiers/sellers/0", "requestHeaders": { "X-OpenActive-Test-Client-Id": "test", "X-OpenActive-Test-Seller-Id": "https://localhost:5001/api/identifiers/sellers/0" } }, "secondary": { "@type": "Person", "@id": "https://localhost:5001/api/identifiers/sellers/1" } }, "useRandomOpportunities": true, "generateConformanceCertificate": true, "conformanceCertificateId": "https://openactive.io/openactive-test-suite/example-output/random/certification/" }' npm start
  ```

## Continuous Integration

This is useful for running both packages within a continuous integration environment, as shown below:

```bash
#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Get the latest OpenActive Test Suite
git clone git@github.com:openactive/openactive-test-suite.git

# Install dependencies
npm install --prefix openactive-test-suite

# Start broker microservice and run tests
npm start --prefix openactive-test-suite
```

Note that running `npm start` in the root `openactive-test-suite` directory will override `waitForHarvestCompletion` to `true` in `default.json`, so that the `openactive-integration-tests` will wait for the `openactive-broker-microservice` to be ready before it begins the test run.

# Contributing

- [Contributing to the project](./CONTRIBUTING.md)
