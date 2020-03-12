const _ = require('lodash');
const {promises: fs} = require("fs");

// abstract class, implement shared methods
class BaseLogger {
  constructor() {
    this.flow = {};
    this.logs = [];
  }

  get testMeta() {
    return {
      ancestorTitles: testState.ancestorTitles,
      title: testState.currentTest && testState.currentTest.description,
      fullName: testState.fullName,
    };
  }

  recordLogEntry(entry) {
    let log = {
      ...(this.testMeta),
      ...entry
    };

    this.logs.push(log);

    return log;
  }

  recordRequest(stage, request) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].request) this.flow[stage].request = {};

    this.flow[stage].request = request;
  }

  recordResponse(stage, response) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    let fields = {
      body: response.body,
      responseTime: response.responseTime,
    };

    if (response.response) {
      fields = {
        ...fields,
        status: response.response.statusCode,
        statusMessage: response.response.statusMessage,
        headers: response.response.headers
      }
    }

    Object.assign(this.flow[stage].response, fields);
  }

  recordRequestResponse(stage, request, responsePromise) {
    let entry = this.recordLogEntry({
      type: "request",
      stage: stage,
      request: {
        ...request
      },
      isPending: true,
      duration: 0
    });

    // manually count how long it's been waiting
    // todo: capture a timestamp and hook into test state instead
    let responseTimer = setInterval(() => {
      entry.duration += 100;
    }, 100);

    // capture response once it's ready, stop above timer
    Promise.resolve(responsePromise).then((response) => {
      clearInterval(responseTimer);

      entry.isPending = false;

      let responseFields = {
        body: response.body,
        responseTime: response.responseTime,
      };

      if (response.response) {
        responseFields = {
          ...responseFields,
          status: response.response.statusCode,
          statusMessage: response.response.statusMessage,
          headers: response.response.headers
        }
      }

      entry.response = responseFields;
    });
  }

  recordResponseValidations(stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    this.flow[stage].response.validations = data;

    this.recordLogEntry({
      type: "validations",
      stage: stage,
      validations: data
    });
  }

  async writeMeta() {
    let data = _(this).omit([
      'suite'
    ]);

    let json = JSON.stringify(data, null, 4);

    await fs.writeFile(this.metaPath, json);
  }

  get suiteName() {
    throw Error('suiteName unimplemented');
  }

  get metaPath() {
    return `./output/json/${this.suiteName}.json`;
  }

  get markdownPath() {
    return `./output/${this.suiteName}.md`;
  }
}

class Logger extends BaseLogger {
  constructor(title, suite, meta) {
    super();
    this.title = title;
    this.suite = suite;
    this.workingLog = "";

    this.suites = [];
    this.specs = {};

    meta && Object.assign(this, meta);

    afterAll && afterAll(() => {
      return this.writeMeta();
    });

    testState.on('suite-started', (suite) => {
      this.suites.push(testState.ancestorTitles);
    });

    testState.on('spec-started', (spec) => {
      let key = testState.ancestorTitles;
      if (!this.specs[key]) {
        this.specs[key] = [];
      }
      this.specs[key].push(testState.currentTest.description);
    });
  }

  get suiteName() {
    return this.suite.getFullName()
  }
}

class ReporterLogger extends BaseLogger {
  constructor(testName) {
    super();

    this.testName = testName;
  }

  async load() {
    let data = await fs.readFile(this.metaPath, 'utf8');
    data = JSON.parse(data);

    Object.assign(this, data);
  }

  get suiteName() {
    return this.testName;
  }

  get activeSuites() {
    let activeSuites = [];
    for (let log of this.logs) {
      activeSuites.push(log.ancestorTitles);
    }
    activeSuites = _.uniqWith(activeSuites, _.isEqual);

    let active = this.suites.filter(suite => {
      return _.find(activeSuites, (asuite) => _.isEqual(suite, asuite));
    });

    return active;
  }

  recordTestResult(stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};
    if (!this.flow[stage].response.specs) this.flow[stage].response.specs = [];

    this.flow[stage].response.specs.push(data);

    this.logs.push({
      type: "spec",
      ancestorTitles: data.ancestorTitles,
      title: data.title,
      fullName: data.fullName,
      spec: data
    });
  }

  logsFor(suite, type) {
    let result = this.logs.filter((log) => {
      if (!suite && log.type == type) return true;

      return _.isEqual(log.ancestorTitles, suite) && log.type == type;
    });

    return result;
  }
}

module.exports = {
  Logger,
  ReporterLogger
};
