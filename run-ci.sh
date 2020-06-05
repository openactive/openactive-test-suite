#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Install dependencies
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Run tests
npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/

# Kill broker microservice
kill $pid
