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

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for info on how the flow validations are written.
