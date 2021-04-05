const _ = require('lodash');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const {promises: fs} = require("fs");
const moment = require('moment');
const rmfr = require('rmfr');
const axios = require("axios");

const {ReporterLogger} = require('./helpers/logger');
const {ReportGenerator, SummaryReportGenerator} = require('./report-generator');
const {CertificationWriter} = require('./certification/certification-writer');
const {validateCertificateHtml} = require('./certification/certification-validator');
const { getConfigVarOrDefault, getConfigVarOrThrow } = require('./helpers/config-utils');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;
const GENERATE_CONFORMANCE_CERTIFICATE = getConfigVarOrDefault('integrationTests', 'generateConformanceCertificate', false);
const CONFORMANCE_CERTIFICATE_ID = GENERATE_CONFORMANCE_CERTIFICATE ? getConfigVarOrThrow('integrationTests', 'conformanceCertificateId') : null;
const OUTPUT_PATH = getConfigVarOrThrow('integrationTests', 'outputPath');

class Reporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunStart(test, results) {
    await mkdirp(`${OUTPUT_PATH}json`);
    // TODO: Replace the line below to remove any files that have not been created by this test run
    // To allow Markdown auto-reload features to work (as file must be updated, not deleted, between test runs)
    // await rmfr(`${OUTPUT_PATH}*.md`, {glob: true});
    await rmfr(`${OUTPUT_PATH}json/*.json`, {glob: true});
    await rmfr(`${OUTPUT_PATH}certification/*.html`, {glob: true});

    // Used for validator remoteJsonCachePath
    await mkdirp('./tmp');
  }
  onTestStart(test) {

  }

  async onTestResult(test, testResult, aggregatedResults) {
    // Workaround to skip reporting of empty todo tests, to handle implemented/not-implemented test.todo('') in feature-helper.js
    if (Array.isArray(testResult.testResults) && testResult.testResults.length === 1 && testResult.testResults[0].fullName === '' && testResult.testResults[0].status === 'todo') return;

    try {
      let testResults = testResult.testResults;

      let grouped = _.groupBy(testResults, (spec) => spec.ancestorTitles.slice(0, 3).join(" "));

      for (let [testIdentifier, groupedTests] of Object.entries(grouped)) {
        let logger = new ReporterLogger(testIdentifier);
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
    let datasetJson = await axios.get(MICROSERVICE_BASE + "/dataset-site");
    datasetJson = datasetJson && datasetJson.data;

    let loggers = await SummaryReportGenerator.getLoggersFromFiles();
    let generator = new SummaryReportGenerator(loggers, datasetJson, CONFORMANCE_CERTIFICATE_ID);
    await generator.report();
    await generator.writeSummaryMeta();

    const {
      numRuntimeErrorTestSuites,
      numFailedTestSuites,
      numFailedTests,
      numPassedTests,
      numPendingTests,
      testResults,
      numTotalTests,
      numTodoTests,
      startTime
    } = results;
    console.log(chalk.white(`Ran ${numTotalTests - numTodoTests} tests in ${testDuration(startTime)}`));
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

    // Output runtime failures from test suites, that will not feature in the summary
    if (numRuntimeErrorTestSuites > 0) {
      console.log(chalk.red('\n\nTest suite runtime errors:'));
      testResults.filter(x => x.failureMessage !== null && x.testResults.length === 0).forEach((testFile) => {
        console.log(chalk.red(`- ${testFile.testFilePath}`));
        console.log(chalk.red(`  ${testFile.failureMessage}`));
      });
    }

    // Catch straggling failures that are not featured in the summary
    if (numFailedTests > 0 && generator.summaryMeta.features.every(x => x.overallStatus === 'passed')) {
      console.log(chalk.red('\n\nHidden test failures:'));
      testResults.filter(x => x.numFailingTests > 0).forEach((testFile) => {
        console.log(chalk.red(`- ${testFile.testFilePath}`));
        testFile.testResults.filter(x => x.status !== 'passed').forEach((testResult) => {
          console.log(chalk.red(`  - ${testResult.fullName}: ${testResult.status}`));
          testResult.failureMessages.forEach((failureMessage) => {
            console.log(chalk.red(`    - ${failureMessage}`));
          });
        });
      });
    }
    
    if (GENERATE_CONFORMANCE_CERTIFICATE) {
      if (numFailedTests > 0 || numFailedTestSuites > 0 || numRuntimeErrorTestSuites > 0) {
        console.log('\n' + chalk.yellow("Conformance certificate could not be generated as not all tests passed."));
      } else if (numPendingTests > 0) {
          console.log('\n' + chalk.yellow("Conformance certificate could not be generated as not all tests were completed."));
      } else { 
        let certificationWriter = new CertificationWriter(loggers, generator, datasetJson, CONFORMANCE_CERTIFICATE_ID);
        let html = await certificationWriter.generateCertificate();

        let validationResult = await validateCertificateHtml(html, CONFORMANCE_CERTIFICATE_ID, certificationWriter.awardedTo.name);
        if (!validationResult || !validationResult.valid) {
          console.error('\n' + chalk.red(
            "A valid conformance certificate could not be generated.\n\nIf you have not already done so, try simply running `npm start`, without specifying a specific test directory, to ensure that all tests are run for this feature configuration."
          ));
          // Ensure that CI fails on validation error, without a stack trace
          process.exitCode = 1;
        } else {
          await mkdirp(`${OUTPUT_PATH}certification`);
          await fs.writeFile(certificationWriter.certificationOutputPath, html);
          console.log('\n' + chalk.green(
            `Conformance certificate for '${certificationWriter.awardedTo.name}' generated successfully: ${certificationWriter.certificationOutputPath} and must be made available at '${CONFORMANCE_CERTIFICATE_ID}' to be valid.`
          ));
        }
      }
    }

    function testDuration(startTime) {
      const delta = moment.duration(moment() - new Date(startTime));
      const seconds = delta.seconds();
      const millis = delta.milliseconds();
      return `${seconds}.${millis} s`;
    }
  }
}

module.exports = Reporter;
