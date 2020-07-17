#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# `waitForHarvestCompletion` must be set to `true` in `default.json`

# Install dependencies
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Kill broker microservice in case of error
trap 'err=$?; echo >&2 "Exiting on error $err"; kill $pid; exit $err' ERR

# Run tests
npm start --prefix packages/openactive-integration-tests

# Kill broker microservice on success
kill $pid
