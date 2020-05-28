# Jest concepts

Jest is multi-process. There's the overall Jest process, which has a bunch of workers which execute the individual test suites (e.g. individual -test.js files). The environment of this main process is different to the worker.

Jest internally uses a fork of Jasmine. This is used as the test runner, and implements standard jest features such as `describe` and `it`.

# Logging/reporting pipeline

Jasmine and Jest as a whole are designed for more binary-like states, a test either passes or fails. With OpenActive the needs a little different to what it's designed for. We generate a lot more debugging level information, and have different levels of failures (i.e. warnings, information, suggestions).

The process can be summarised as:

- Jasmine reporter: provides state info
- Logger:  uses state info, used by tests to record info
- Jest reporter: used to capture test results, and kick off report generation
- Report generator: generates the reports in both markdown and for cli.

## Jasmine Reporter

This is a state tracker for internal use by the logger, this allows determining within tests the current running test and suite, and also allows hooking the events.

## Logger

A logger component has been implemented, this deterministically names the filename based on the describe blocks.

This has helper methods for attaching info to the current running test:

- Request:
    - Saves request (payload, url)
    - Response (headers, status, response, response time)
    - Records whether a response was never received (i.e. timedout)
- Validation:
    - Validation responses from [https://github.com/openactive/data-model-validator](https://github.com/openactive/data-model-validator), the core library behind [https://validator.openactive.io/](https://validator.openactive.io/)
- Specs:
    - Spec result status, this is the result of each `it` test - note that this can't happen during runtime and happens in the next phase.

## Jest reporter

The Jest reporter takes in the files produced by the logger, at this point we have the test statuses. The test statuses are added to the json file and re-saved. The Report Generator is kicked off.

## Report generator

This is mostly a wrapper around the logger. This implements the various templating methods such as JSON formatting, colour handling, status icons, etc.

In addition, the logger has helper methods to extract events of a particular type, and to iterate through suite names. 

The report itself uses Handlebars (a Mustache influenced/compatible templating engine), this runs using the logger helper methods, in addition to the Handlebars helper methods added in the reporter.
