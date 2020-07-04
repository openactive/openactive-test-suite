const _ = require('lodash');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const {promises: fs} = require("fs");
const moment = require('moment');
const rmfr = require('rmfr');
const config = require('config');
const axios = require("axios");

const {ReporterLogger} = require('./helpers/logger');
const {ReportGenerator, SummaryReportGenerator} = require('./report-generator');
const {CertificationWriter} = require('./certification/certification-writer');
const {validateCertificateHtml} = require('./certification/certification-validator');

const MICROSERVICE_BASE = config.get("microserviceApiBase");
const GENERATE_CONFORMANCE_CERTIFICATE = config.has('generateConformanceCertificate') && config.get('generateConformanceCertificate');
const CONFORMANCE_CERTIFICATE_ID = GENERATE_CONFORMANCE_CERTIFICATE ? config.get('conformanceCertificateId') : null;

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
    await rmfr('./output/certification/*.html', {glob: true});

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
    try {
      let datasetJson = await axios.get(MICROSERVICE_BASE + "dataset-site");
      datasetJson = datasetJson && datasetJson.data;

      let loggers = await SummaryReportGenerator.getLoggersFromFiles();
      let generator = new SummaryReportGenerator(loggers, datasetJson, CONFORMANCE_CERTIFICATE_ID);
      await generator.report();
      await generator.writeSummaryMeta();

      const {
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
      
      if (GENERATE_CONFORMANCE_CERTIFICATE) {
        if (numFailedTests > 0) {
          console.log('\n' + chalk.yellow("Conformance certificate could not be generated as not all tests passed."));
        } else if (numPendingTests > 0) {
            console.log('\n' + chalk.yellow("Conformance certificate could not be generated as not all tests were completed."));
        } else { 
          let certificationWriter = new CertificationWriter(loggers, generator, datasetJson, CONFORMANCE_CERTIFICATE_ID);
          let html = await certificationWriter.generateCertificate();

          if (!await validateCertificateHtml(html, CONFORMANCE_CERTIFICATE_ID, certificationWriter.awardedTo.name)) {
            throw new Error("A valid conformance certificate could not be generated, likely because not all tests were run for this feature configuration. Try simply running `npm test`, without specifying a specific test directory.");
          } 

          await mkdirp('./output/certification');
          await fs.writeFile(certificationWriter.certificationOutputPath, html);
          console.log('\n' + chalk.green(
            `Conformance certificate for '${certificationWriter.awardedTo.name}' generated successfully: ${certificationWriter.certificationOutputPath} and must be made available at '${CONFORMANCE_CERTIFICATE_ID}' to be valid.`
          ));
        }
      }  
    }
    catch (e) {
      console.error(e);
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
