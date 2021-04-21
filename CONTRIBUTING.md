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

The OpenActive Test Suite is developed against a reference implementation, [OpenActive.Server.NET](https://github.com/openactive/OpenActive.Server.NET/).

The CI checks that the Test Suite passes for the reference implementation. Therefore, the approach for adding each new test is to work on both:

- Reference Implementation: The implementation of the feature that's being tested.
- Test Suite: The test itself.

Any new feature that affects test coverage must be developed in a `coverage/*` branch in both reposities, in order for the CI to automatically run both feature branches against each other.

### Locally running the Reference Implementation

When you're working on both the Reference Implementation and the Test Suite, you'll want to run the Reference Implementation locally so you can check that the new tests and the new implementations work together.

Additionally, when running the Reference Implementation locally, there is no limit on the number of tests you can run. The live version has a quota.

How to run them both locally:

* Reference Implementation: To run this locally, follow the guidelines in its [project](https://github.com/openactive/OpenActive.Server.NET)'s documentation
* Test Suite: With Reference Implementation running locally, use the `dev` config by setting env var `NODE_APP_INSTANCE=dev`.
    e.g., to run broker and a specific test separately:
    ```sh
    NODE_APP_INSTANCE=dev npm run start-broker # to start the broker
    # in another terminal:
    NODE_APP_INSTANCE=dev npm run start-tests  -- packages/openactive-integration-tests/test/features/core/common-error-conditions/implemented/not-bookable-test.js
    ```

**N.B.:** When running Reference Implementation locally, the `unknown-endpoint` test in `core/common-error-conditions` will fail as the dev version of Reference Implementation shows a developer error page instead of the regular 404 response.

## Pull Request Process

Changes should be made by starting a new branch (from `master`), writing the changes in that branch and then submitting a Pull Request to rebase that branch into `master`.

For new features that affect test coverage, use a `coverage/*` branch in this repository that matches a `coverage/*` branch in [OpenActive.Server.NET](https://github.com/openactive/OpenActive.Server.NET/). The OpenActive.Server.NET CI will use the tests in the test-suite branch to test the server's changes.

1. Every Pull Request should solve or partially solve an existing GitHub issue.
2. Ensure that documentation reflects the new changes.
3. Check that CI tests pass before merging a Pull Request.
4. Ensure that your Pull Request has at least one approval before merging.
