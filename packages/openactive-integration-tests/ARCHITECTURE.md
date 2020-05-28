The test framework uses [Jest](https://jestjs.io/), a test framework by Facebook. This is utilised as it’s one of the more flexible and powerful testing frameworks around.

# Jest concepts

Jest is multi-process. There’s a main Jest process, which spawns a pool of workers that in turn execute the individual test suites (e.g. individual -test.js files). The environment of this main process is different to the worker, which can complicate getting information between the child process and the parent.

Jest internally uses a [fork](https://github.com/facebook/jest/tree/master/packages/jest-jasmine2) of [Jasmine](https://jasmine.github.io/). This is used as the test runner, and implements common test features such as `describe` and `it`.

# Logging/reporting pipeline

Jasmine and Jest are designed for binary test states: a test either passes or fails. OpenActive’s needs are a little different. More debugging level information is required to help booking system developers act on failures and there are different levels of failures (i.e. warnings, information, suggestions).

The process can be summarised as:

- [Jasmine reporter](test/test-framework/jasmine-state-reporter.js): provides state info
- [Logger](test/helpers/logger.js): uses state info, used by tests to record info
- [Jest reporter](test/reporter.js): used to capture test results, and kick off report generation
- [Report generator](test/report-generator.js): generates the reports in both markdown and for cli.

## Jasmine Reporter

This is a state tracker for internal use by the logger, this allows determining within tests the current running test and suite. Throughout execution, it keeps track of the ancestors which allows re-building the tree of parents, so that a full path can be returned at any time.

There is also an EventEmitter implemented in the helper, allowing the logger to listen for these same events, at present only the suite ended event is listened for - this is used as a hook to save files upon finishing.

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

The Jest reporter takes in the files produced by the logger, at this point we have the test statuses. The test statuses are added to the json file and re-saved. The Report Generator is kicked off.

## Report generator

This is mostly a wrapper around the logger. This implements the various templating methods such as JSON formatting, colour handling, status icons, etc.

In addition, the logger has helper methods to extract events of a particular type, and to iterate through suite names.

The report itself uses Handlebars (a Mustache influenced/compatible templating engine), this runs using the logger helper methods, in addition to the Handlebars helper methods added in the reporter.

# Request / Flow

The test framework uses a number of request helpers and state trackers to simplify implementation of tests.

These consist of:

- [Chakram](http://dareid.github.io/chakram/): This is a HTTP test framework designed for Mocha (however it works fine on Jest)
- [Request helper](test/helpers/request-helper.js): This makes requests, and records the request + response against the logger. There are methods to directly make requests, along with methods for each API endpoint.
- [State tracker](test/helpers/request-state.js): This wraps the API endpoint methods, stores the results and automatically uses these in successive requests, i.e. if you make an order, it keeps the order ID to be auto-used in the next request.
- [Flow](test/helpers/flow-helper.js): This is another wrapper around state and implements methods for each stage of the booking process. This keeps track of whether a pre-requisite has ran or not, and if not runs it. This has additional validation.
