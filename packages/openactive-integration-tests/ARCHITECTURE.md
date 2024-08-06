The test framework uses [Jest](https://jestjs.io/), a test framework by Facebook. This is utilised as it’s one of the more flexible and powerful testing frameworks around.

# Jest concepts

Jest is multi-process. There’s a main Jest process, which spawns a pool of workers that in turn execute the individual test suites (e.g. individual -test.js files). The environment of this main process is different to the worker, which can complicate getting information between the child process and the parent.

Jest internally uses a [fork](https://github.com/facebook/jest/tree/master/packages/jest-jasmine2) of [Jasmine](https://jasmine.github.io/). This is used as the test runner, and implements common test features such as `describe` and `it`.

# Logging/reporting pipeline

Jasmine and Jest are designed for binary test states: a test either passes or fails. OpenActive’s needs are a little different. More debugging level information is required to help booking system developers act on failures and there are different levels of failures (i.e. warnings, information, suggestions).

The process can be summarised as:

- [Jasmine State Reporter](test/test-framework/jasmine-state-reporter.js): provides state info
- [Logger](test/helpers/logger.js): uses state info, used by tests to record info
- [Jest reporter](test/reporter.js): used to capture test results, and kick off report generation
- [Report generator](test/report-generator.js): generates the reports in both markdown and for cli.

## Jasmine State Reporter

This is a state tracker for internal use by the **Logger**, this allows determining within tests the current running test and suite. Throughout execution, it keeps track of the ancestors which allows re-building the tree of parents, so that a full path can be returned at any time.

There is also an EventEmitter implemented in the helper, allowing the **Logger** to listen for these same events, at present only the suite ended event is listened for - this is used as a hook to save files upon finishing.

## Logger

A logger component has been implemented. This is mostly a data collection tool which gathers the necessary info, and saves a log of it within JSON files. The JSON file is deterministically named based on the describe blocks, which allows picking it back up in a later phase.

This has helper methods for attaching info to the current running test:

- Request:
    - Saves request (payload, url)
    - Response (headers, status, response, response time)
    - Records whether a response was never received (i.e. timedout)
- Validation:
    - Validation responses from [https://github.com/openactive/data-model-validator](https://github.com/openactive/data-model-validator), the same library behind [https://validator.openactive.io/](https://validator.openactive.io/)
- Specs:
    - Spec result status, this is the result of each `it` test - note that this can’t happen during runtime and happens in the next phase.

## Jest reporter

The Jest reporter takes in the files produced by the **Logger**, at this point we have the test statuses. The test statuses are added to the json file and re-saved. The **Report Generator** is kicked off.

## Report generator

This is mostly a wrapper around the **Logger**. This implements the various templating methods such as JSON formatting, colour handling, status icons, etc.

In addition, the **Logger** has helper methods to extract events of a particular type, and to iterate through suite names.

The report itself uses Handlebars (a Mustache influenced/compatible templating engine), this runs using the **Logger** helper methods, in addition to the Handlebars helper methods added in the reporter.


# Request flow

The test framework uses a number of request helpers and state trackers to simplify implementation of tests.

These consist of:

- [Chakram](http://dareid.github.io/chakram/): This is a HTTP test framework designed for Mocha (however it works fine on Jest)
- [Request helper](test/helpers/request-helper.js): This makes HTTP requests (e.g. to the Booking System under test; or to the Broker Microservice), and records the request + response against the **Logger**. There are methods to directly make requests, along with methods for each API endpoint.
- [Flow Stages](test/helpers/flow-stages/flow-stage.js): A part of the booking flow (e.g. the C1 request). Use it to call the relevant API endpoint. When called, it stores the results, which can then be applied to successive Flow Stages (e.g. C1 output can be used for the C2 request).

# Test flow

- [Feature helper](test/helpers/feature-helper.js): This wraps up the initialisation of the test, implementing the describe blocks and initialising the **Logger**.

## Feature Helper

`FeatureHelper.describeFeature(..)` greatly simplifies the initialisation of each test.

Example usage:

```js
FeatureHelper.describeFeature(module, {
  testCategory: 'core',
  testFeature: 'availability-check',
  testFeatureImplemented: true,
  testIdentifier: 'availability-confirmed',
  testName: 'Occupancy in C1 and C2 matches feed',
  testDescription: 'Runs C1 and C2 for a known opportunity from the feed, and compares the results to those attained from the feed.',
  // The primary opportunity criteria to use for the primary OrderItem under test
  testOpportunityCriteria: 'TestOpportunityBookable',
  // The secondary opportunity criteria to use for multiple OrderItem tests
  controlOpportunityCriteria: 'TestOpportunityBookable',
},
function (configuration, orderItemCriteriaList, featureIsImplemented, logger) {
```

This is what **Feature Helper** helps with:

### Test Matrix

Most tests are run for all Booking Flows in Scope ([Simple Booking Flow](https://openactive.io/open-booking-api/EditorsDraft/#simple-booking-flow) and [Booking Flow with Approval](https://openactive.io/open-booking-api/EditorsDraft/#booking-flow-with-approval)) as well as for all Bookable Opportunity Types in Scope (e.g. ScheduledSession, IndividualFacilityUseSlot, etc). These two dimensions create a matrix of permutations which must be run for each test.

FeatureHelper handles this automatically, running the test for each permutation in the matrix.

If a test does not support an Opportunity Type or Booking Flow, it can be excluded from the matrix via the appropriate `skip-` parameters to `FeatureHelper.describeFeature(..)`, for example `skipOpportunityTypes: ['IndividualFacilityUseSlot']`.

### Auto-Generates Documentation

`FeatureHelper.describeFeature(..)` saves some metadata about the test (to the test file's CommonJS module), which is then used by **Documentation Generator** to automatically generate the documentation for that test.

Therefore, if a test is written without FeatureHelper, it will not be documented.

### Sets up `describe` hooks

Sets up the `describe` hooks for the test, in a standardised structure. This structure of `describe(..)` blocks is very important as it is used by the **Logging/reporting pipeline** to generate the test report in the desired format.

### Decides which tests to skip

`FeatureHelper.describeFeature(..)` will automatically skip any tests which cannot run due to the Test Suite user's config e.g. if a user does not have the [Booking Flow with Approval](https://openactive.io/open-booking-api/EditorsDraft/#booking-flow-with-approval) in scope, then any approval-related tests will be skipped.

# Documentation Generator

Documentation Generator automatically generates documentation for each test and aggregates them for the Test Suite as a whole, as well as at the feature levels.

This automatically generated documentation is outputted to ./test/features/README.md for the whole Test Suite, and ./test/features/<CATEGORY>/<FEATURE>/README.md for each feature.

For input, the Documentation Generator uses:

- The feature's `feature.json` file, which must be manually maintained.
- Metadata about the test, which is automatically populated into the test's CommonJS module by **Feature Helper**.
