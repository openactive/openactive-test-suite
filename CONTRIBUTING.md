# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, Slack, or any other method with the owners of this repository before making a change.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Commits

Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. This makes our commit history easy to understand by humans and by automated tools.

## Pull Request Process

Changes should be made by starting a new branch (from `master`), writing the changes in that branch and then submitting a Pull Request to rebase that branch into `master`.

1. Every Pull Request should solve or partially solve an existing GitHub issue.
2. For changes to the `openactive-integration-tests` package, run the documentation generator, by running `npm run doc-gen --prefix packages/openactive-integration-tests`.
3. Ensure that documentation reflects the new changes.
4. Check that CI tests pass before merging a Pull Request.
5. Ensure that your Pull Request has at least one approval before merging.

## Reference Implementation

The OpenActive Test Suite is developed against a reference implementation, [OpenActive.Server.NET](https://github.com/openactive/OpenActive.Server.NET/).

The CI checks that the Test Suite passes for the reference implementation. Therefore, the approach for adding each new test is to work on both:

- Reference Implementation: The implementation of the feature that's being tested.
- Test Suite: The test itself.

# Code of Conduct

By contributing to this project you agree to follow our [Code of Conduct](https://openactive.io/public-openactive-w3c/code-of-conduct/).
