const EventEmitter = require('events');

class JasmineStateReporter {
  constructor() {
    this.emitter = new EventEmitter();
  }

  suiteStarted = suite => {
    if (this.currentSuite) {
      suite._parent = this.currentSuite;
    }
    this.currentSuite = suite;

    this.emitter.emit('suite-started', suite);
  };

  suiteDone = suite => {
    if (this.currentSuite) {
      this.currentSuite = this.currentSuite._parent;
    }

    this.emitter.emit('suite-done', suite);
  };

  specStarted = result => {
    this.currentTest = result;

    this.emitter.emit('spec-started', result);
  };

  specDone = result => {
    this.currentTest = result;

    this.emitter.emit('spec-done', result);
  };

  get fullName() {
    if (this.currentTest) {
      return this.currentTest.fullName;
    }
    else if (this.currentSuite) {
      return this.currentSuite.fullName;
    }
  }

  get ancestorTitles() {
    let suite = this.currentSuite;
    let path = [];
    while (suite) {
      path.unshift(suite.description);

      suite = suite._parent;
    }
    return path;
  }

  on(...args) {
    return this.emitter.on(...args);
  }
}

global.testState = new JasmineStateReporter();

jasmine.getEnv().addReporter(testState);
