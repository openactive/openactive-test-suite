# Contributing

Spontaneous bug fixes and incremental feature PRs are welcome! However, before making substantial changes to this repository, we encourage you to first discuss the change you wish to make via an issue, Slack, or any other method with the owners of this repository.

Please note we have a [Code of Conduct](https://openactive.io/public-openactive-w3c/code-of-conduct/), please follow it in all your interactions with the project.

## Code Quality

New code should, as much as possible, lead to increased coverage of:

- ESLinting
- TypeScript type checking

So that the codebase becomes more reliable over time.

More generally, the rule is: "Leave it at least as good as you found it. Preferably, a little better ☺️".

## Commits

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. This makes our commit history easy to understand by humans and by automated tools.

When code is committed, the documentation generator is automatically run. This process uses a pre-commit hook using [husky](https://github.com/typicode/husky).

## Reference Implementation

[**OpenActive.Server.NET**](https://github.com/openactive/OpenActive.Server.NET/) is a .NET SDK which can be used to create Open Booking API implementations.

OpenActive.Server.NET contains a **reference implementation** of the Open Booking API, which is called [`BookingSystem.AspNetCore`](https://github.com/openactive/OpenActive.Server.NET/tree/master/Examples/BookingSystem.AspNetCore).

The OpenActive Test Suite is developed against [`BookingSystem.AspNetCore`](https://github.com/openactive/OpenActive.Server.NET/tree/master/Examples/BookingSystem.AspNetCore). Test Suite's CI checks that the Test Suite passes for this reference implementation.

Therefore, the approach for adding or updating tests is to work on both:

- [OpenActive.Server.NET](https://github.com/openactive/OpenActive.Server.NET/): Ensure that the expected behaviour is implemented in the reference implementation. This may require making changes to the libraries within the SDK, which the reference implementation uses, or the reference implementation ([`BookingSystem.AspNetCore`](https://github.com/openactive/OpenActive.Server.NET/tree/master/Examples/BookingSystem.AspNetCore)) itself.

    In some cases, no changes are needed here as the updates to tests may be testing behaviours that have already been correctly implemented in the reference implementation.
- [Test Suite](.): The tests.

Please be sure to follow the [**Pull Request Process**](#pull-request-process) when making changes to ensure that changes in both projects are tested together in CI.

When the necessary changes are made to both OpenActive.Server.NET and Test Suite, test them together on your machine by following the steps in [**Locally running Test Suite to test changes**](#locally-running-test-suite-to-test-changes).

## Pull Request Process

Changes should be made by starting a new branch (from `master`), writing the changes in that branch and then submitting a Pull Request to rebase that branch into `master`.

For new features that affect test coverage, use a `coverage/*` branch in this repository that matches a `coverage/*` branch in [OpenActive.Server.NET](https://github.com/openactive/OpenActive.Server.NET/). The OpenActive.Server.NET CI will use the tests in the test-suite branch to test the server's changes.

1. Every Pull Request should solve or partially solve an existing GitHub issue.
2. Ensure that documentation reflects the new changes.
3. Check that CI tests pass before merging a Pull Request.
4. Ensure that your Pull Request has at least one approval before merging.

## Writing a new test

See the [Integration Tests CONTRIBUTING.md](./packages/openactive-integration-tests/CONTRIBUTING.md) for guidance on writing a new test.

## Locally running Test Suite to test changes

When you are making changes to the Test Suite, please run it on your machine to check that the changes work before submitting a [pull request](#pull-request-process). These changes can be checked against the [**reference implementation**](#reference-implementation). You may or may not also have changes to the reference implementation that is required for your updated tests to pass. Either way, you'll need to run both projects on your machine order to test your changes.

How to run them both locally:

* **Reference Implementation**: To run this locally, follow the guidelines in its [project's contribution documentation](https://github.com/openactive/OpenActive.Server.NET/blob/master/CONTRIBUTING.md).
* **Test Suite**: With the reference implementation running locally, use the [`default-dev.json` config](./config/default-dev.json) by setting env var `NODE_APP_INSTANCE=dev`.

    For example, to run broker and a specific test separately (See [**Tips for quicker test runs**](#tips-for-quicker-test-runs) for a more efficient process):

    ```sh
    NODE_APP_INSTANCE=dev npm start
    ```

**N.B.:** When running the reference implementation locally, the `unknown-endpoint` test in `core/common-error-conditions` will fail as the dev version of reference implementation shows a developer error page instead of the regular 404 response.

### Tips for quicker test runs

Running all of the tests can take a long time. To speed up your development/testing feedback loop, you can:

1. Run a single test at a time, rather than running all of the tests.
2. Keep [Broker Microservice](./packages/openactive-broker-microservice/) running in the background, rather than restarting it for each test.

Here's an example of how to do this:

```sh
# In one terminal, start broker
NODE_APP_INSTANCE=dev npm run start-broker

# Then, in ANOTHER terminal, run the opportunity-in-past single test
NODE_APP_INSTANCE=dev npm run start-tests -- packages/openactive-integration-tests/test/features/core/common-error-conditions/implemented/opportunity-in-past-test.js
# OR, run only the common-error-conditions feature
NODE_APP_INSTANCE=dev npm run start-tests -- packages/openactive-integration-tests/test/features/core/common-error-conditions/
```

#### Even quicker test runs - reduce random test data

When using the [`default-dev.json` config](./config/default-dev.json) (i.e. with `NODE_APP_INSTANCE=dev`), Test Suite is set to use [**controlled mode**](https://developer.openactive.io/open-booking-api/key-decisions#controlled-mode). This means that it creates all the data that it needs for testing. Therefore, the [reference implementation](#reference-implementation) does not need to generate its own data, which it does by default.

Turning this off will speed up the bootstrapping of both reference implementation and broker microservice, which no longer needs to harvest lots of data.

To do this, see the [**Optimizing for Controlled Mode**](https://github.com/openactive/OpenActive.Server.NET/blob/master/CONTRIBUTING.md#optimizing-for-controlled-mode) section of OpenActive.Server.NET's contribution documentation.

### NODE_APP_INSTANCE=dev

Setting env var `NODE_APP_INSTANCE=dev` informs Test Suite to use the [`default-dev.json` config file](./config/default-dev.json), which is configured to run against the reference implementation running locally.

`NODE_APP_INSTANCE` is a feature of the [`config`](https://github.com/node-config/node-config/) library.
