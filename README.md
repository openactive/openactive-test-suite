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
 - `npm install`
 
This will install the dependencies needed for both packages.

For developers that are customising the installation, for use in e.g. Docker, the directory `./packages/test-interface-criteria` is a dependency, and so must be present during `npm install`.

## Running

```bash
npm start
```

This will run the broker microservice and then run the tests against it.

This can be configured with the environment variable `NODE_CONFIG`, where any config specified will be override both the `openactive-broker-microservice` and the `openactive-test-suite`. More detail can be found in the [node-config docs](https://github.com/lorenwest/node-config/wiki/Environment-Variables#node_config).

  ```bash
  NODE_CONFIG='{ "waitForHarvestCompletion": true, "datasetSiteUrl": "https://localhost:5001/openactive", "sellers": { "primary": { "@type": "Organization", "@id": "https://localhost:5001/api/identifiers/sellers/0", "requestHeaders": { "X-OpenActive-Test-Client-Id": "test", "X-OpenActive-Test-Seller-Id": "https://localhost:5001/api/identifiers/sellers/0" } }, "secondary": { "@type": "Person", "@id": "https://localhost:5001/api/identifiers/sellers/1" } }, "useRandomOpportunities": true, "generateConformanceCertificate": true, "conformanceCertificateId": "https://openactive.io/openactive-test-suite/example-output/random/certification/" }' npm start
  ```

Additionally, any extra command line args will be passed to `jest` in the openactive-test-suite e.g. `npm start --runInBand -- test/features/core/availability-check/`. Read about Jest's command line args in their [CLI docs](https://jestjs.io/docs/en/cli).

## Continuous Integration

This is useful for running both packages within a continuous integration environment, as shown below:

```bash
#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Install dependencies
npm install

# Start broker microservice and run tests
npm start
```

Note that running `npm start` in the root directory will override `waitForHarvestCompletion` to `true` in `default.json`, so that the `openactive-integration-tests` will wait for the `openactive-broker-microservice` to be ready before it begins the test run.

# Contributing

- [Contributing to the project](./CONTRIBUTING.md)
