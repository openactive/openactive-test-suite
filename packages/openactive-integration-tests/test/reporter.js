const _ = require('lodash');
const mkdirp = require('mkdirp');
const rmfr = require('rmfr');

const {ReporterLogger} = require('./helpers/logger');
const {ReportGenerator} = require('./report-generator');

class Reporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunStart(test, results) {
    await mkdirp('./output/meta');
    await rmfr('./output/meta/*.json', {glob: true});
  }
  onTestStart(test) {

  }

  async onTestResult(test, testResult, aggregatedResults) {
    try {
      let testResults = testResult.testResults;

      let grouped = _.groupBy(testResults, (spec) => spec.ancestorTitles.slice(0, 2).join(" "));

      for (let [testName, groupedTests] of Object.entries(grouped)) {
        let logger = new ReporterLogger(testName);
        await logger.load();

        for (let testResult of groupedTests) {
          logger.recordTestResult(testResult.ancestorTitles[2], testResult);
        }

        await logger.writeMeta();

        console.log('generating report');

        let reportGenerator = new ReportGenerator(logger);
        await reportGenerator.report();
      }
    }
    catch(exception) {
      console.log(testResult);
      console.error('err', exception);
    }
  }

  onRunComplete() {
  }
}

module.exports = Reporter;
