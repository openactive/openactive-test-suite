/* eslint-disable class-methods-use-this */
const _ = require('lodash');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const { promises: fs } = require('fs');
const rmfr = require('rmfr');
const axios = require('axios');

const { ReporterLogger } = require('./helpers/logger');
const { ReportGenerator, SummaryReportGenerator } = require('./report-generator');
const { CertificationWriter } = require('./certification/certification-writer');
const { validateCertificateHtml } = require('./certification/certification-validator');
const { getConfigVarOrDefault, getConfigVarOrThrow } = require('./helpers/config-utils');

const MICROSERVICE_BASE = `http://localhost:${process.env.PORT || 3000}`;
const GENERATE_CONFORMANCE_CERTIFICATE = getConfigVarOrDefault('integrationTests', 'generateConformanceCertificate', false);
const CONFORMANCE_CERTIFICATE_ID = GENERATE_CONFORMANCE_CERTIFICATE ? getConfigVarOrThrow('integrationTests', 'conformanceCertificateId') : null;
const OUTPUT_PATH = getConfigVarOrThrow('integrationTests', 'outputPath');
const CONSOLE_OUTPUT_LEVEL = getConfigVarOrThrow(null, 'consoleOutputLevel');

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
    await rmfr(`${OUTPUT_PATH}json/*.json`, { glob: true });
    await rmfr(`${OUTPUT_PATH}certification/*.html`, { glob: true });

    // Used for validator remoteJsonCachePath
    await mkdirp('./tmp');
  }

  onTestStart(test) {

  }

  async onTestResult(test, testResult, aggregatedResults) {
    // Workaround to skip reporting of empty todo tests, to handle implemented/not-implemented test.todo('') in feature-helper.js
    if (Array.isArray(testResult.testResults) && testResult.testResults.length === 1 && testResult.testResults[0].fullName === '' && testResult.testResults[0].status === 'todo') return;

    try {
      const { testResults } = testResult;

      /* ancestorTitles is the sequence of `describe(..)` labels for each test.
      We group our labels using the 1st four labels, which are:
      1. Feature
      2. Test Identifier
      3. Booking Flow
      4. Opportunity Type */
      const grouped = _.groupBy(testResults, spec => spec.ancestorTitles.slice(0, 4).join(' '));

      for (const [testIdentifier, groupedTests] of Object.entries(grouped)) {
        const logger = new ReporterLogger(testIdentifier);
        await logger.load();

        for (const singleTestResult of groupedTests) {
          /* ancestorTitles[4] is the first `describe(..)` label within the test itself.
          It will generally be the name of a stage e.g. C1 */
          logger.recordTestResult(singleTestResult.ancestorTitles[4], singleTestResult);
        }

        logger.testFilePath = test.testFilePath;
        logger.snapshot = test.snapshot;

        await logger.writeMeta();

        const reportGenerator = new ReportGenerator(logger);
        await reportGenerator.report(CONSOLE_OUTPUT_LEVEL === 'dot');

        if (CONSOLE_OUTPUT_LEVEL === 'dot') {
          for (let i = 0; i < testResult.testResults.length; i += 1) {
            if (testResult.testResults[i].status === 'passed') {
              process.stdout.write(chalk.green('.'));
            } else if (testResult.testResults[i].status === 'pending') {
              process.stdout.write('*');
            } else {
              process.stdout.write(chalk.red('F'));
            }
          }
        }
      }
    } catch (exception) {
      console.trace(testResult);
      console.error('logger error', exception);
    }
  }

  // based on https://github.com/pierreroth64/jest-spec-reporter/blob/master/lib/jest-spec-reporter.js
  async onRunComplete(test, results) {
    let datasetJson = await axios.get(`${MICROSERVICE_BASE}/dataset-site`);
    datasetJson = datasetJson && datasetJson.data;

    // Add a separator in case CONSOLE_OUTPUT_LEVEL === 'dot'
    console.log('\n');

    const loggers = await SummaryReportGenerator.getLoggersFromFiles();
    const generator = new SummaryReportGenerator(loggers, datasetJson, results, CONFORMANCE_CERTIFICATE_ID);
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
      startTime,
    } = results;
    console.log(chalk.white(`Ran ${numTotalTests - numTodoTests} tests in ${testDuration(startTime)}`));
    if (numPassedTests) {
      console.log(chalk.green(
        `✅ ${numPassedTests} passing`,
      ));
    }
    if (numFailedTests) {
      console.log(chalk.red(
        `❌ ${numFailedTests} failing`,
      ));
    }
    if (numPendingTests) {
      console.log(chalk.yellow(
        `– ${numPendingTests} pending`,
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

    // Catch any tests marked as pending, if all other tests have succeeded
    if (numPendingTests > 0 && generator.summaryMeta.features.every(x => x.overallStatus === 'passed')) {
      console.log(chalk.yellow('\n\nPending tests:'));
      testResults.filter(x => x.numPendingTests > 0).forEach((testFile) => {
        console.log(chalk.yellow(`- ${testFile.testFilePath}`));
        testFile.testResults.filter(x => x.status === 'pending').forEach((testResult) => {
          console.log(chalk.yellow(`  - ${testResult.fullName}: ${testResult.status}`));
          testResult.failureMessages.forEach((failureMessage) => {
            console.log(chalk.yellow(`    - ${failureMessage}`));
          });
        });
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
        console.log(`\n${chalk.yellow('Conformance certificate could not be generated as not all tests passed.')}`);
      } else if (numPendingTests > 0) {
        console.log(`\n${chalk.yellow('Conformance certificate could not be generated as not all tests were completed.')}`);
      } else {
        const certificationWriter = new CertificationWriter(loggers, generator, datasetJson, CONFORMANCE_CERTIFICATE_ID);
        const html = await certificationWriter.generateCertificate();

        const validationResult = await validateCertificateHtml(html, CONFORMANCE_CERTIFICATE_ID, certificationWriter.awardedTo.name);
        /* process.env.DEBUG_SAVE_INVALID_CONFORMANCE_CERTIFICATE can be used to ensure a certificate is saved even if it
        is not valid. This can help with debugging conformance certificates */
        if (validationResult?.valid || process.env.DEBUG_SAVE_INVALID_CONFORMANCE_CERTIFICATE === 'true') {
          const filename = 'index.html';
          await mkdirp(certificationWriter.certificationOutputPath);
          await fs.writeFile(certificationWriter.certificationOutputPath + filename, html);
          if (validationResult?.valid) {
            console.log(`\n${chalk.green(
              `Conformance certificate for '${certificationWriter.awardedTo.name}' generated successfully: ${certificationWriter.certificationOutputPath + filename} and must be made available at '${CONFORMANCE_CERTIFICATE_ID}' to be valid.`,
            )}`);
          } else {
            console.log(`\n${chalk.red(
              `Conformance certificate not valid but saved anyway to: ${certificationWriter.certificationOutputPath + filename}`,
            )}`);
          }
        }
        if (!validationResult?.valid) {
          console.error(`\n${chalk.red(
            'A valid conformance certificate could not be generated.\n\nIf you have not already done so, try simply running `npm start`, without specifying a specific test subset, to ensure that all tests are run for this feature configuration.',
          )}`);
          // Ensure that CI fails on validation error, without a stack trace
          process.exitCode = 1;
        }
      }
    }

    function testDuration(startTimeString) {
      const millis = (new Date()).getTime() - (new Date(startTimeString)).getTime();
      return millisToMinutesAndSeconds(millis);
    }

    function millisToMinutesAndSeconds(millis) {
      const minutes = Math.floor(millis / 60000);
      const seconds = ((millis % 60000) / 1000);
      return `${minutes > 0 ? `${minutes}m ` : ''}${seconds.toFixed(3)}s`;
    }
  }
}

module.exports = Reporter;
