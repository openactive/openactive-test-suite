const _ = require('lodash');
const {promises: fs} = require("fs");

// abstract class, implement shared methods
class BaseLogger {
  constructor() {
    this.flow = {};
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

  recordResponseValidations(stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    this.flow[stage].response.validations = data;
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

    meta && Object.assign(this, meta);

    afterAll && afterAll(() => {
      return this.writeMeta();
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

  recordTestResult(stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};
    if (!this.flow[stage].response.specs) this.flow[stage].response.specs = [];

    this.flow[stage].response.specs.push(data);
  }
}

module.exports = {
  Logger,
  ReporterLogger
};
