/*
 * This script runs the broker microservice in the background, and then executes the tests. 
 * It kills the broker microservice before exiting, and returns the exit code of either in case of failure.
 */

const { fork } = require('child_process');
const nodeCleanup = require('node-cleanup');

// Override waitForHarvestCompletion in the environment
const nodeConfig = process.env.NODE_CONFIG ? JSON.parse(process.env.NODE_CONFIG) : {};
nodeConfig.waitForHarvestCompletion = true;
process.env.NODE_CONFIG = JSON.stringify(nodeConfig);

let microservice = null;
let integrationTests = null;

nodeCleanup(function (exitCode, signal) {
    if (microservice !== null) microservice.kill();
    if (integrationTests !== null) integrationTests.kill();
});

microservice = fork('app.js', [], { cwd: './packages/openactive-broker-microservice/'} );
integrationTests = fork('./node_modules/jest/bin/jest.js', process.argv.slice(2), { cwd: './packages/openactive-integration-tests/'} );

// If microservice exits, kill the integration tests (as something has gone wrong somewhere)
microservice.on('close', (code) => {
  if (integrationTests !== null) integrationTests.kill();
  // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
  if (code !== 0 && code !== null) process.exitCode = code;
});

// When integration tests exit, kill the microservice
integrationTests.on('close', (code) => {
  if (microservice !== null) microservice.kill();
  // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
  if (code !== 0 && code !== null) process.exitCode = code;
});
