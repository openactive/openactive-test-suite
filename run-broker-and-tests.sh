#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# `waitForHarvestCompletion` must be set to `true` in `default.json`

# Start broker microservice in the background
broker_config=${BROKER_CONFIG:-'{}'} # config defaults to empty object
NODE_CONFIG=${broker_config} npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Kill broker microservice in case of error
trap 'err=$?; echo >&2 "Exiting on error $err"; kill $pid; exit $err' ERR

# Run tests
tests_config=${TESTS_CONFIG:-'{}'} # config defaults to empty object
NODE_CONFIG=${tests_config} npm start --prefix packages/openactive-integration-tests "$@"

# Kill broker microservice on success
kill $pid
