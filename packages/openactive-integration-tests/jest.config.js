const path = require('path');

// Inform config library that config is in the root directory (https://github.com/lorenwest/node-config/wiki/Configuration-Files#config-directory)
process.env.NODE_CONFIG_DIR = path.join(__dirname, '..', '..', 'config');

const config = require('config');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  verbose: false,
  testMatch: [
    '**/test/features/**/*-test.[tj]s?(x)',
  ],
  reporters: [
    '<rootDir>test/reporter.js',
    ...config.get('integrationTests.additionalReporters'),
  ],
  setupFilesAfterEnv: [
    '<rootDir>test/setup.js',
  ],
  globalSetup: '<rootDir>test/global-setup.js',
  globalTeardown: '<rootDir>test/global-teardown.js',
  maxWorkers: config.get('integrationTests.maximumNumberOfSimultaneousBookings'),
  testTimeout: config.get('integrationTests.testTimeout'),
  transform: {},
  testEnvironment: '<rootDir>test/testEnvironment.js',
};
