const {JasmineStateReporter} = require('./test-framework/jasmine-state-reporter');

global.testState = new JasmineStateReporter();

jasmine.getEnv().addReporter(testState);
