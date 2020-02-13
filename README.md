# OpenActive Test Suite

The general aim of this project is to allow end to end testing of the various flows and failure states.

This repo hosts two different projects.
* Broker service: this sits in between the test suite and the target site. This allows the test suite to watch for changes, and throws them back to it.
* Test suite: this allows automated tests against the API

## Configuration
Configure the endpoint urls in:
 - packages/openactive-broker-microservice/config/default.json
    - bookingApiBase: URI for the booking service API
    - openFeedBase: RPDE Feed URL
 - packages/openactive-integration-tests/config/test.json
    - bookingApiBase: URI for the booking service API
    - microserviceApiBase: Broker URI

# Installation
 - `npm install`
 
This will install the dependencies needed for both packages.

## Running

The broker is a pre-requisite to running the test suite.

### Broker
```bash
cd packages/openactive-broker-microservice
npm run start
```

### Tests
```bash
cd packages/openactive-integration-tests
npm run test
```

For more info, read the individual README.md within the package dirs.
