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

    this.writeMeta();
  }

  recordResponse(stage, response) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    this.flow[stage].response.status = response.status;
    this.flow[stage].response.body = response.body;

    this.writeMeta();
  }

  recordResponseValidations(stage, data) {
    if (!this.flow[stage]) this.flow[stage] = {};
    if (!this.flow[stage].response) this.flow[stage].response = {};

    this.flow[stage].response.validations = data;

    this.writeMeta();
  }

  async writeMeta() {
    let data = _(this).omit([
      'suite'
    ]);

    let json = JSON.stringify(data, null, 4);

    await fs.writeFile(this.metaPath, json);
  }
}

class Logger extends BaseLogger {
  constructor(title, suite, meta) {
    super();
    this.title = title;
    this.suite = suite;
    this.workingLog = "";

    meta && Object.assign(this, meta);
  }

  async flush() {
    var filename = "./output/" + this.title + ".txt";
    await fs.writeFile(filename, this.workingLog);

    // await this.writeMeta();
  }
  log(text) {
    this.workingLog += text + "\n";
    this.flush(); // TODO: Do we need to flush on each write?
  }

  get metaPath() {
    let name = this.suite.getFullName();

    return `./output/meta/${name}.json`;
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

  get metaPath() {
    return `./output/meta/${this.testName}.json`;
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
