#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Get the latest OpenActive Test Suite
git clone git@github.com:openactive/openactive-test-suite.git

# Install dependencies
npm install --prefix openactive-test-suite

# Start broker microservice and run tests
npm start --prefix openactive-test-suite
