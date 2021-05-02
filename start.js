/*
 * This script runs the broker microservice in the background, and then executes the tests. 
 * It kills the broker microservice before exiting, and returns the exit code of either in case of failure.
 */

const { fork } = require('child_process');
const nodeCleanup = require('node-cleanup');
const inquirer = require('inquirer');
const config = require('config');
const readline = require('readline');

const IS_RUNNING_IN_CI = config.has('ci') ? config.get('ci') : false;

if (IS_RUNNING_IN_CI) {
  console.log('OpenActive Test Suite running in non-interactive mode, as `ci` is set to `true`\n');
}

// Force TTY based on environment variable to ensure correct TTY output from piped child process
if (process.stdout.isTTY) {
  process.env.FORCE_TTY = 'true';
  process.env.FORCE_TTY_COLUMNS = process.stdout.columns;
  // Force Chalk to display colours
  process.env.FORCE_COLOR = 'true'
}

const BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE = config.get('integrationTests.bookableOpportunityTypesInScope');
const BOOKING_FLOWS_IN_SCOPE = config.get('integrationTests.bookingFlowsInScope');
let bookableOpportunityTypes = Object.entries(BOOKABLE_OPPORTUNITY_TYPES_IN_SCOPE).filter(([, v]) => v).map(([k]) => k);
let bookingFlows = Object.entries(BOOKING_FLOWS_IN_SCOPE).filter(([, v]) => v).map(([k]) => k);
let flowPathOptions = [
  {name: `All`, value: ''},
  ...bookingFlows.flatMap(bookingFlow => 
    [...bookableOpportunityTypes, 'Multiple'].map(bookableOpportunityType => 
      ({name: `${bookingFlow} >> ${bookableOpportunityType}`, value: `${bookingFlow}/${bookableOpportunityType}`})
    )
  ),
];
let currentFlowPathSelection = '';


// Override waitForHarvestCompletion in the environment
const nodeConfig = process.env.NODE_CONFIG ? JSON.parse(process.env.NODE_CONFIG) : {};
if (!nodeConfig.broker) nodeConfig.broker = {};
nodeConfig.broker.waitForHarvestCompletion = true;
process.env.NODE_CONFIG = JSON.stringify(nodeConfig);

let microservice = null;
let integrationTests = null;
let prompt;

nodeCleanup(function (exitCode, signal) {
    if (microservice !== null) microservice.kill();
    microservice = null;
    if (integrationTests !== null) integrationTests.kill();
});

function setupEscapeKey()
{
  // inquirer resets raw mode after the prompt completes, so resume it to allow esc to be detected
  process.stdin.setRawMode(true);
  // inquirer pauses the stream after the prompt completes, so resume it to allow esc to be detected
  process.stdin.resume();
}

// Setup escape key to cancel running tests
readline.emitKeypressEvents(process.stdin);
process.stdin.on('keypress', (ch, key) => {
  if (!key) {
    return;
  }
  if (key.name === 'escape') {
    if (integrationTests !== null) integrationTests.kill();
  } else if (key.ctrl && key.name === 'c') {
    process.exit(); // eslint-disable-line unicorn/no-process-exit
  }
});
setupEscapeKey();

microservice = fork('app.js', [], { cwd: './packages/openactive-broker-microservice/', silent: true } );
microservice.stdout.pipe(process.stdout);
microservice.stderr.pipe(process.stderr);

// If microservice exits, kill the integration tests (as something has gone wrong somewhere)
microservice.on('close', (code) => {
  microservice = null;
  // Close prompt if currently open
  prompt?.ui?.close();

  if (integrationTests !== null) integrationTests.kill();
  // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
  if (code !== 0 && code !== null) process.exitCode = code;
});

// Wait for microservice to start listening before starting integration tests
microservice.once('message', (message) => {
  if (message === 'listening') {
    launchIntegrationTests(process.argv.slice(2), '');
  }
});

function launchIntegrationTests(args, singleFlowPathMode) {
  process.env.SINGLE_FLOW_PATH_MODE = singleFlowPathMode;
  integrationTests = fork('./node_modules/jest/bin/jest.js', args, { cwd: './packages/openactive-integration-tests/'} );
  if (IS_RUNNING_IN_CI) {
    // When integration tests exit, kill the microservice
    integrationTests.on('close', (code) => {
      if (microservice !== null) microservice.kill();
      // If exit code is not successful, use this for the result of the whole process (to ensure CI fails)
      if (code !== 0 && code !== null) process.exitCode = code;
    });
  } else {
    integrationTests.on('close', async (code) => {
      if (!microservice) return;
        
      // Ensure that harvesting is paused even in the event of a fatal error within the test suite
      microservice.send('pause');

      // Hide microservice output
      microservice.stdout.pause();
      microservice.stderr.pause();      

      const testArgs = args.join(' ');
    
      console.log(`
Pausing broker microservice...

When data feeds are stable or when using 'controlled' mode, tests can be rerun
quickly without reharvesting. However, for 'random' mode, if data feeds have
been updated without the RPDE 'modified' property being updated (e.g. when
implementing the RPDE feed itself), please exit the test suite and rerun it,
in order to harvest the latest data.
`);

      prompt = inquirer.prompt([
        {
          type: 'input',
          name: 'testArgs',
          message: 'Rerun tests (ctrl+c to exit)?',
          default: testArgs
        },
        {
          type: 'rawlist',
          name: 'flowPath',
          message: 'Which flow path?',
          choices: flowPathOptions,
          loop: false,
          pageSize: 20,
          default: currentFlowPathSelection,
        }
      ]);
      var response = await prompt;
      console.log('');

      if (typeof response.flowPath === 'string') {
        currentFlowPathSelection = response.flowPath;
        launchIntegrationTests(response.testArgs.split(' '), response.flowPath);
      } else {
        // If ctrl+c or ctrl+d was pressed
        if (microservice !== null) microservice.kill();
      }

      // Resume microservice
      microservice.send('resume');

      // Show microservice output
      microservice.stdout.resume();
      microservice.stderr.resume();

      // Ensure escape key can be captured
      setupEscapeKey();
    });
  }
}