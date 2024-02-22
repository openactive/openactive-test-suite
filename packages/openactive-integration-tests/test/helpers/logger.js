const _ = require("lodash");
const {promises: fs} = require("fs");
const mapping = require('../helpers/mapping');
const { getConfigVarOrThrow } = require('./config-utils');

/**
 * @typedef {import('chakram').ChakramResponse} ChakramResponse
 */

const OUTPUT_PATH = getConfigVarOrThrow('integrationTests', 'outputPath');
const USE_RANDOM_OPPORTUNITIES = getConfigVarOrThrow('integrationTests', 'useRandomOpportunities');

// abstract class, implement shared methods
class BaseLogger {
  constructor () {
    this.flow = {};
    this.logs = [];
    this.timestamp = (new Date()).toString();
    /** @type {{[k: string]: any} | null} */
    this.config = null;
    /** @type {boolean | null} */
    this.implemented = null;
  }

  get testMeta () {
    return {
      ancestorTitles: global.testState.ancestorTitles,
      title: global.testState.currentTest && global.testState.currentTest.description,
      fullName: global.testState.fullName,
    };
  }

  recordLogEntry(entry) {
    const log = {
      ...(this.testMeta),
      ...entry,
    };

    this.logs.push(log);

    return log;
  }

  recordLogResult(stage, description, json) {
    const log = {
      ...(this.testMeta),
      type: 'result',
      stage,
      description,
      jsonResult: json,
    };

    this.logs.push(log);

    return log;
  }

  recordLogHeadlineMessage(title, message) {
    const log = {
      ...(this.testMeta),
      type: 'information',
      title,
      message,
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

    if (response.error) {
      fields = {
        ...fields,
        error: response.error.message,
      };
    }

    Object.assign(this.flow[stage].response, fields);
  }

  /**
   * @param {string} stage
   * @param {{[k: string]: unknown}} request
   * @param {any} requestMetadata
   * @param {Promise<ChakramResponse>} responsePromise
   */
  recordRequestResponse(stage, request, requestMetadata, responsePromise) {
    const entry = this.recordLogEntry({
      type: 'request',
      stage,
      request: {
        ...request,
      },
      isPending: true,
      requestMetadata,
      duration: 0,
    });

    // manually count how long it's been waiting
    // todo: capture a timestamp and hook into test state instead
    const responseTimer = setInterval(() => {
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

      if (response.error) {
        responseFields = {
          ...responseFields,
          error: response.error.message,
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

    let json = JSON.stringify(data, null, 2);

    await fs.writeFile(this.metaPath, json);
  }

  setJestContext (context) {
    this.jestContext = context;
  }

  /**
   * @returns {string}
   */
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

  get testFileName () {
    return `test/features/${this.config.testCategory}/${this.config.testFeature}/${this.config.testFeatureImplemented ? 'implemented' : 'not-implemented'}/${this.config.testIdentifier}-test.js`;
  }

  get referenceImplementationResultUrl () {
    // @ts-ignore
    return `https://openactive.io/openactive-test-suite/example-output/${USE_RANDOM_OPPORTUNITIES ? 'random' : 'controlled'}/${this.config.testFeature}_${this.config.testIdentifier}_${this.bookingFlow}_${this.opportunityType}.html`;
  }

  get implementedDisplayLabel() {
    return this.implemented ? 'Implemented' : 'Not Implemented';
  }

  get suiteName() {
    return this.testName;
  }

  get metaLocalPath () {
    return `${this.uniqueSuiteName.replace(/\s+/g, '_')}.json`;
  }

  get metaPath () {
    return `${OUTPUT_PATH}json/${this.metaLocalPath}`;
  }

  get htmlLocalPath () {
    return `${this.uniqueSuiteName.replace(/\s+/g, '_')}.html`;
  }

  get htmlPath () {
    return `${OUTPUT_PATH}${this.htmlLocalPath}`;
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

  get specStatusCountsForEachSuiteName()  {
    if (this._specStatusCountsBySuiteName) return this._specStatusCountsBySuiteName;
    
    let statusBySuiteName =  _.chain(this.logs)
    .filter(log => log.type === "spec")
    .groupBy(log => log.ancestorTitles.join(" > "))
    .mapValues(logs => _.countBy(logs, log => log.spec.status))
    .value();

    return this._specStatusCountsBySuiteName = statusBySuiteName;
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
    return result;
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

    // Add certificateMetaLocalPath for use by certificate validator, when Jest is fully stubbed
    suite.certificateMetaLocalPath = this.metaLocalPath;

    // Record the ancestorTitles path relevant to the logger
    this.baseAncestorTitles = this.getAncestorTitles();

    global.testState.on("suite-started", (suite) => {
      // Note these events are triggered for all instances of the logger,
      // as the events are global, so we must check the event is relevant to this instance
      if (!this.inScopeForThisLoggerInstance(global.testState.ancestorTitles)) return;
      this.suites.push(global.testState.ancestorTitles);
    });

    global.testState.on("spec-started", (spec) => {
      // Note these events are triggered for all instances of the logger,
      // as the events are global, so we must check the event is relevant to this instance
      if (!this.inScopeForThisLoggerInstance(global.testState.ancestorTitles)) return;
      let key = global.testState.ancestorTitles;
      if (!this.specs[key]) {
        this.specs[key] = [];
      }
      this.specs[key].push(global.testState.currentTest.description);
    });
  }

  get uniqueSuiteName () {
    return this.suite.getFullName();
  }

  inScopeForThisLoggerInstance (ancestorTitles) {
    // Check the path of this spec begins with the base path
    if (ancestorTitles.length < this.baseAncestorTitles.length) return false;
    var a = this.baseAncestorTitles
    return a.every((e, i) => e === ancestorTitles[i]);
  }

  getAncestorTitles () {
    let suite = this.suite;
    let path = [];
    while (suite) {
      if (suite.description !== '') path.unshift(suite.description);

      suite = suite.parentSuite;
    }
    return path;
  }
}

class ReporterLogger extends BaseLogger {
  constructor (testFileIdentifier) {
    super();

    this.testFileIdentifier = testFileIdentifier;
    this.suites = [];
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
    const types = type.split(',');
    let result = this.logs.filter((log) => {
      if (!suite && types.includes(log.type)) return true;

      return _.isEqual(log.ancestorTitles, suite) && types.includes(log.type);
    });

    return result;
  }

  statusFor (suiteName) {
    let specStatusCountsBySuiteName = this.specStatusCountsForEachSuiteName;
    let joinedSuiteName = suiteName.join(" > ");
    let spec = specStatusCountsBySuiteName[joinedSuiteName];
    if (spec) {
      if (spec.failed > 0) return "failed";
      return "passed"
    }
    return "";
  }
}

/**
 * @typedef {InstanceType<typeof Logger>} LoggerType
 * @typedef {InstanceType<typeof BaseLogger>} BaseLoggerType
 */

module.exports = {
  Logger,
  ReporterLogger,
};
