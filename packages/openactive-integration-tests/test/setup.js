class JasmineStateReporter {
  suiteStarted = suite => {
    if (this.currentSuite) {
      suite._parent = this.currentSuite;
    }
    this.currentSuite = suite;
  };

  suiteDone = suite => {
    if (this.currentSuite) {
      this.currentSuite = this.currentSuite._parent;
    }
  };

  specStarted = result => {
    this.currentTest = result;
  };

  specDone = result => {
    this.currentTest = result;
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
}

global.testState = new JasmineStateReporter();

jasmine.getEnv().addReporter(testState);
