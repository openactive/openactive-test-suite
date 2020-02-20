jasmine.getEnv().addReporter({
  specStarted: result => jasmine.currentTest = result,
  specDone: result => jasmine.currentTest = result,
});


const reporter = require('./reporter');

jasmine.getEnv().addReporter(new reporter());
