#!/bin/bash
set -e # exit with nonzero exit code if anything fails

# Get the latest OpenActive Test Suite
git clone git@github.com:openactive/openactive-test-suite.git
cd openactive-test-suite

# Install dependencies
npm install

# Start broker microservice and run tests
npm start
