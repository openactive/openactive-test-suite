# openactive-integration-tests

This Node.js script runs tests against the specified openactive-broker-microservice instance

## Test cases

- Confirm Availability
  - Availability confirmed
  - No Spaces available
- Book
  - Book and customer cancels: failure (past booking)
  - Book and customer cancels: success

- Check session series inheritance is implemented correctly (and that ids always match on input and output)

## Usage
1. `npm install`
2. `npm run test`

### Running specific tests in parallel via multiple processes

`npm run test -- test/flows/book-only/book-only-success/book-random-test.js`

### Running core tests in a single process

`npm test --runInBand -- test/features/core/`

## Reading test results

Test results are written to /output/*.md in Markdown format.

To read these files, the [Markdown Viewer Chrome Extension](https://chrome.google.com/webstore/detail/markdown-viewer/ckkdlimhmcjmikdlpkmbgfkaikojcbjk) is recommended, with the following settings:
- CONTENT -> "autoreload" on
- ADVANCED OPTIONS -> ALLOW ACCESS TO FILE:// URLS (links to setting in Chrome Extensions settings of the same name)

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for info on how the flow validations are written.

### Debugging tests

`npm run test --reporters default`


