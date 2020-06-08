# `waitForHarvestCompletion` must be set to `true` in `default.json`

# Install dependencies
npm install --prefix packages/openactive-broker-microservice
npm install --prefix packages/openactive-integration-tests

# Start broker microservice in the background
npm start --prefix packages/openactive-broker-microservice &
pid=$!

# Run tests
npm test --prefix packages/openactive-integration-tests

# Kill broker microservice
kill $pid
