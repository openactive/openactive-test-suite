const _ = require("lodash");
const {promises: fs} = require("fs");
const mapping = require('../helpers/mapping');

// abstract class, implement shared methods
class BaseLogger {
  constructor () {
    this.flow = {};
    this.logs = [];
    this.timestamp = (new Date()).toString();
  }

  get testMeta () {
    return {
      ancestorTitles: testState.ancestorTitles,
      title: testState.currentTest && testState.currentTest.description,
      fullName: testState.fullName,
    };
  }

  recordLogEntry (entry) {
    let log = {
      ...(this.testMeta),
      ...entry,
    };

    this.logs.push(log);

    return log;
  }

  recordRequest (stage, request) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].request) this.flow[stage].request = {};

    this.flow[stage].request = request;
  }

  recordResponse (stage, response) {
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
        headers: response.response.headers,
      };
    }

    Object.assign(this.flow[stage].response, fields);
  }

  recordRequestResponse (stage, request, responsePromise) {
    let entry = this.recordLogEntry({
      type: "request",
      stage: stage,
      request: {
        ...request,
      },
      isPending: true,
      duration: 0,
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
          headers: response.response.headers,
        };
      }

      entry.response = responseFields;
    });
  }

  recordResponseValidations (stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    this.flow[stage].response.validations = data;

    this.recordLogEntry({
      type: "validations",
      stage: stage,
      validations: data,
    });
  }

  async writeMeta () {
    let data = _.chain(this).omit([
      "suite",
    ]).value();

    let json = JSON.stringify(data, null, 4);

    await fs.writeFile(this.metaPath, json);
  }

  setJestContext (context) {
    this.jestContext = context;
  }

  get uniqueSuiteName () {
    throw Error("suiteName unimplemented");
  }

  get testCategory() {
    if (this.config && this.config.testCategory) return this.config.testCategory;
  }

  get testFeature() {
    if (this.config && this.config.testFeature) return this.config.testFeature;
  }

  get testIdentifier() {
    if (this.config && this.config.testIdentifier) return this.config.testIdentifier;
  }

  get testName() {
    if (this.config && this.config.testName) return this.config.testName;
  }

  get categoryName() {
    return mapping.lookup(this.testCategory);
  }

  get featureName() {
    return mapping.lookup([
      this.testCategory,
      this.testFeature
    ].join("|"));
  }

  get suiteName() {
    return this.testName;
  }

  get metaPath () {
    return `./output/json/${this.uniqueSuiteName.replace(/\s+/g, '_')}.json`;
  }

  get markdownLocalPath () {
    return `${this.uniqueSuiteName.replace(/\s+/g, '_')}.md`;
  }

  get markdownPath () {
    return `./output/${this.markdownLocalPath}`;
  }

  get validationStatusCounts () {
    if (this._validationStatusCounts) return this._validationStatusCounts;

    let statuses = _.chain(this.logs)
      .filter(log => log.type === "validations")
      .flatMap(log => log.validations)
      .countBy(log => log.severity)
      .value();

    return this._validationStatusCounts = {
      ...statuses,
      suggestion: statuses.suggestion || 0,
      warning: statuses.warning || 0,
      failure: statuses.failure || 0,
    };
  }

  get specStatusCounts () {
    if (this._specStatusCounts) return this._specStatusCounts;

    let statuses = _.chain(this.logs)
      .filter(log => log.type === "spec")
      .filter(log => log.title !== "passes validation checks")
      .countBy(log => log.spec.status)
      .value();

    return this._specStatusCounts = {
      ...statuses,
      failed: statuses.failed || 0,
      passed: statuses.passed || 0,
    };
  }

  get overallStatus() {
    let spec = this.specStatusCounts;
    let validation = this.validationStatusCounts;

    if (spec.failed > 0) return "failed";
    else if (validation.failure > 0) return "failed";
    else if (validation.warning > 0) return "warning";
    else return "passed";
  }

  get numValidationStatuses () {
    let validations = _
      .chain(this.logs)
      .filter(item => item.type === "validations")
      .flatMap(item => item.validations);
    // .sumBy(item => item.validations.length);

    let result = {
      warning: 0,
      failure: 0,
      suggestion: 0,
    };

    for (let type of Object.keys(result)) {
      result[type] = validations.filter(item => item);
    }
  }

  get numFailed () {
    return this.specStatusCounts.failed + this.validationStatusCounts.failure;
  }

  get numWarnings () {
    return this.validationStatusCounts.warning;
  }

  get numSuggestions () {
    return this.validationStatusCounts.suggestion;
  }

  get numPassed () {
    return this.specStatusCounts.passed;
  }
}

class Logger extends BaseLogger {
  constructor (title, suite, meta) {
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

    testState.on("suite-started", (suite) => {
      this.suites.push(testState.ancestorTitles);
    });

    testState.on("spec-started", (spec) => {
      let key = testState.ancestorTitles;
      if (!this.specs[key]) {
        this.specs[key] = [];
      }
      this.specs[key].push(testState.currentTest.description);
    });
  }

  get uniqueSuiteName () {
    return this.suite.getFullName();
  }
}

class ReporterLogger extends BaseLogger {
  constructor (testFileIdentifier) {
    super();

    this.testFileIdentifier = testFileIdentifier;
  }

  async load () {
    let data = await fs.readFile(this.metaPath, "utf8");
    data = JSON.parse(data);

    Object.assign(this, data);
  }

  get uniqueSuiteName () {
    return this.testFileIdentifier;
  }

  get activeSuites () {
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

  recordTestResult (stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};
    if (!this.flow[stage].response.specs) this.flow[stage].response.specs = [];

    this.flow[stage].response.specs.push(data);

    this.logs.push({
      type: "spec",
      ancestorTitles: data.ancestorTitles,
      title: data.title,
      fullName: data.fullName,
      spec: data,
    });
  }

  logsFor (suite, type) {
    let result = this.logs.filter((log) => {
      if (!suite && log.type == type) return true;

      return _.isEqual(log.ancestorTitles, suite) && log.type == type;
    });

    return result;
  }
}

module.exports = {
  Logger,
  ReporterLogger,
};
