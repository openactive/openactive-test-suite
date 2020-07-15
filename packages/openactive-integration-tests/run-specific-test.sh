#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Usage:
# ./run-specific-test.sh <mode> <test path>

# Usage examples:
# - Random: ./run-specific-test.sh true test/features/core/availability-check/
# - Controlled: ./run-specific-test.sh false test/features/core/availability-check/

# Start broker microservice in the background
NODE_CONFIG="{\"waitForHarvestCompletion\": true}" npm start --prefix ../../packages/openactive-broker-microservice &
pid=$!

# Kill broker microservice in case of error
trap 'err=$?; echo >&2 "Exiting on error $err"; kill $pid; exit $err' ERR

# Run tests
NODE_CONFIG="{\"useRandomOpportunities\": $1, \"generateConformanceCertificate\": false}" npm test --runInBand -- "${@:2}"

# Kill broker microservice on success
kill $pid
