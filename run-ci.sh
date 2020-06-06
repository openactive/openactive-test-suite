#!/bin/bash

# Install dependencies
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Run tests in random mode
NODE_CONFIG='{"useRandomOpportunities": true}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/

# Run tests using booking system Test Interface
NODE_CONFIG='{"useRandomOpportunities": false}' npm test --prefix packages/openactive-integration-tests --runInBand -- test/features/

# Kill broker microservice
kill $pid
