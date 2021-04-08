/*
 * This script runs the broker microservice in the background, and then executes the tests. 
 * It kills the broker microservice before exiting, and returns the exit code of either in case of failure.
 */

const { fork } = require('child_process');
const nodeCleanup = require('node-cleanup');
const prompts = require('prompts');
const config = require('config');

const IS_RUNNING_IN_CI = config.has('ci') ? config.get('ci') : false;

if (IS_RUNNING_IN_CI) {
  console.log('OpenActive Test Suite running in non-interactive mode, as `ci` is set to `true`\n');
}

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = config.get('integrationTests.bookableOpportunityTypesInScope');
let bookableOpportunityTypeEntries = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, v]) => v);
if (bookableOpportunityTypeEntries.length == 1) {
  prompts.override({
    bookableOpportunityTypesInScope: [ bookableOpportunityTypeEntries[0][0] ],
  });
}

// Override waitForHarvestCompletion in the environment
const nodeConfig = process.env.NODE_CONFIG ? JSON.parse(process.env.NODE_CONFIG) : {};
if (!nodeConfig.broker) nodeConfig.broker = {};
nodeConfig.broker.waitForHarvestCompletion = true;
process.env.NODE_CONFIG = JSON.stringify(nodeConfig);

let microservice = null;
let integrationTests = null;

nodeCleanup(function (exitCode, signal) {
    if (microservice !== null) microservice.kill();
    microservice = null;
    if (integrationTests !== null) integrationTests.kill();
});

microservice = fork('app.js', [], { cwd: './packages/openactive-broker-microservice/'} );
launchIntegrationTests(process.argv.slice(2));

// If microservice exits, kill the integration tests (as something has gone wrong somewhere)
microservice.on('close', (code) => {
  microservice = null;
  if (integrationTests !== null) integrationTests.kill();
  // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
  if (code !== 0 && code !== null) process.exitCode = code;
});

function launchIntegrationTests(args, localBookableOpportunityTypesInScope) {
  if (localBookableOpportunityTypesInScope) {
    if (!nodeConfig.integrationTests) nodeConfig.integrationTests = {};
    nodeConfig.integrationTests.bookableOpportunityTypesInScope = localBookableOpportunityTypesInScope;
    process.env.NODE_CONFIG = JSON.stringify(nodeConfig);
  }
  integrationTests = fork('./node_modules/jest/bin/jest.js', args, { cwd: './packages/openactive-integration-tests/'} );
  if (!IS_RUNNING_IN_CI) {
    // When integration tests exit, kill the microservice
    integrationTests.on('close', (code) => {
      if (microservice !== null) microservice.kill();
      // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
      if (code !== 0 && code !== null) process.exitCode = code;
    });
  } else {
    integrationTests.on('close', async (code) => {
      if (!microservice) return;

      const testArgs = args.join(' ');
    
      console.log(`
When data feeds are stable or when using 'controlled' mode, tests can be rerun
quickly without reharvesting. However, for 'random' mode, if data feeds have
been updated without the RPDE 'modified' property being updated (e.g. when
implementing the RPDE feed itself), please exit the test suite and rerun it,
in order to harvest the latest data.
`);
  
      // Ensure that harvesting is paused even in the event of a fatal error within the test suite
      microservice.send('pause');

      const response = await prompts([
        {
          type: 'text',
          name: 'testArgs',
          message: 'Rerun tests (esc to exit)?',
          initial: testArgs
        },
        {
          type: 'multiselect',
          name: 'bookableOpportunityTypesInScope',
          message: 'Which opportunity types?',
          instructions: false,
          choices: bookableOpportunityTypeEntries.map(([key, value]) => ({title: key, value: key, selected: value})),
        }
      ]);
      console.log('');

      if (typeof response.testArgs === 'string' && Array.isArray(response.bookableOpportunityTypesInScope)) {
        bookableOpportunityTypeEntries = bookableOpportunityTypeEntries.map(([k, v]) => [k, response.bookableOpportunityTypesInScope.includes(k)]);
        launchIntegrationTests(response.testArgs.split(' '), Object.fromEntries(bookableOpportunityTypeEntries));
      } else {
        // If esc, abort, ctrl+c, ctrl+d was pressed
        if (microservice !== null) microservice.kill();
      }
    });
  }
}