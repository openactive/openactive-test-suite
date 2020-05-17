const _ = require('lodash');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const moment = require('moment');
const rmfr = require('rmfr');

const {ReporterLogger} = require('./helpers/logger');
const {ReportGenerator, SummaryReportGenerator} = require('./report-generator');

class Reporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunStart(test, results) {
    await mkdirp('./output');
    // TODO: Replace the line below to remove any files that have not been created by this test run
    // To allow Markdown auto-reload features to work (as file must be updated, not deleted, between test runs)
    // await rmfr('./output/*.md', {glob: true});
    await mkdirp('./output/json');
    await rmfr('./output/json/*.json', {glob: true});

    // Used for validator remoteJsonCachePath
    await mkdirp('./tmp');
  }
  onTestStart(test) {

  }

  async onTestResult(test, testResult, aggregatedResults) {
    try {
      let testResults = testResult.testResults;

      let grouped = _.groupBy(testResults, (spec) => spec.ancestorTitles.slice(0, 3).join(" "));

      for (let [testName, groupedTests] of Object.entries(grouped)) {
        let logger = new ReporterLogger(testName);
        await logger.load();

        for (let testResult of groupedTests) {
          logger.recordTestResult(testResult.ancestorTitles[3], testResult);
        }

        logger.testFilePath = test.testFilePath;
        logger.snapshot = test.snapshot;

        await logger.writeMeta();

        let reportGenerator = new ReportGenerator(logger);
        await reportGenerator.report();
      }
    }
    catch(exception) {
      console.log(testResult);
      console.error('logger error', exception);
    }
  }

  // based on https://github.com/pierreroth64/jest-spec-reporter/blob/master/lib/jest-spec-reporter.js
  async onRunComplete(test, results) {
    try {
      let generator = await SummaryReportGenerator.loadFiles();
      await generator.report();
    }
    catch (e) {
      console.error(e);
    }

    const {
      numFailedTests,
      numPassedTests,
      numPendingTests,
      testResults,
      numTotalTests,
      startTime
    } = results;
    console.log(chalk.white(`Ran ${numTotalTests} tests in ${testDuration()}`));
    if (numPassedTests) {
      console.log(chalk.green(
        `✅ ${numPassedTests} passing`
      ));
    }
    if (numFailedTests) {
      console.log(chalk.red(
        `❌ ${numFailedTests} failing`
      ));
    }
    if (numPendingTests) {
      console.log(chalk.yellow(
        `– ${numPendingTests} pending`
      ));
    }

    function testDuration() {
      const delta = moment.duration(moment() - new Date(startTime));
      const seconds = delta.seconds();
      const millis = delta.milliseconds();
      return `${seconds}.${millis} s`;
    }
  }
}

module.exports = Reporter;
