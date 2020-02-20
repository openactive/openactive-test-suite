const {ReporterLogger} = require('./helpers/logger');
const _ = require('lodash');
const mkdirp = require('mkdirp');
class Reporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunStart(test, results) {
    await mkdirp('./output/meta');
  }
  onTestStart(test) {

  }
  async onTestResult(test, testResult, aggregatedResults) {
    console.log('test result');

    let testResults = testResult.testResults;
    let types = _
      .chain(testResults)
      .map((spec) => spec.ancestorTitles.slice(0,2))
      .uniq()
      .value();

    for (let type of types) {
      let testName = type.join(" ");
      let logger = new ReporterLogger(testName);
      await logger.load();

      for (let testResult of testResults) {
        if (!_.isEqual(type, testResult.ancestorTitles.slice(0,2))) continue;

        console.log('recording', testResult.ancestorTitles[2], testResult)

        logger.recordTestResult(testResult.ancestorTitles[2], testResult);
      }

      await logger.writeMeta();
    }
  }

  onRunComplete() {
  }
}

module.exports = Reporter;
