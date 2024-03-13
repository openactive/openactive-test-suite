// TODO fix these issues!
/* eslint-disable no-else-return */
/* eslint-disable no-confusing-arrow */
/* eslint-disable no-return-assign */
/* eslint-disable no-trailing-spaces */
/* eslint-disable operator-linebreak */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable no-shadow */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable arrow-parens */
/* eslint-disable no-extra-semi */
/* eslint-disable function-paren-newline */
/* eslint-disable prefer-template */
/* eslint-disable no-path-concat */
/* eslint-disable semi */
/* eslint-disable no-throw-literal */
/* eslint-disable operator-assignment */
/* eslint-disable no-var */
/* eslint-disable padded-blocks */
/* eslint-disable prefer-const */
/* eslint-disable eqeqeq */
/* eslint-disable block-spacing */
/* eslint-disable spaced-comment */
/* eslint-disable prefer-rest-params */
/* eslint-disable quote-props */
/* eslint-disable space-before-function-paren */
/* eslint-disable class-methods-use-this */
/* eslint-disable object-curly-spacing */
/* eslint-disable import/order */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
const util = require('util');
const chalk = require("chalk");
const Handlebars = require("handlebars");
const fs = require("fs").promises;
const stripAnsi = require("strip-ansi");
const {ReporterLogger} = require("./helpers/logger");
const _ = require("lodash");
const { getConfigVarOrThrow } = require('./helpers/config-utils');
const showdown = require('showdown');
const { FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME } = require('./helpers/suite-name-constants');

/**
 * @typedef {{
 *   [testOpportunityCriteria: string]: {
 *     sellerIds: string[];
 *     opportunityTypes: string[];
 *     bookingFlows: string[];
 *     numTestsFailing: number;
 *   }
 * }} MissingOpportunityDataSummary
 */

const USE_RANDOM_OPPORTUNITIES = getConfigVarOrThrow('integrationTests', 'useRandomOpportunities');
const OUTPUT_PATH = getConfigVarOrThrow('integrationTests', 'outputPath');
const ENABLE_HEADER_LOGGING = getConfigVarOrThrow('integrationTests', 'requestHeaderLogging');

class BaseReportGenerator {
  get templateName () {
    return "report";
  }

  get helpers () {
    return {
      "chalk": function() {
        const args = Array.prototype.slice.apply(arguments);
        const options = args.pop();

        //apply each arg one after another,
        // i.e. if provided with "bold", "red" we want `chalk.bold.red`
        const chalkFn = args.reduce(function(p, n) {return p[n];}, chalk);

        return chalkFn(options.fn(this));
      },
      /**
       * @param {string[]} suiteName
       */
      "renderSuiteName": function(suiteName, options) {
        if (suiteName.length <= 2) return "Test setup";

        return suiteName.slice(4).join(" >> ");
      },
      "validationIcon": function(severity, options) {
        switch (severity) {
          case "passed": // spec
            return "✅";
          case "failed": // spec
          case "failure": // validation
            return "❌️";
          case "warning": // validation
            return "⚠️";
          case "suggestion": // validation
            return "📝";
          default:
            return "❔";
        }
      },
      "consoleValidationIcon": function(severity, options) {
        switch (severity) {
          case "passed": // spec
            return chalk.green("[Y]");
          case "failed": // spec
          case "failure": // validation
            return chalk.red("[X]");
          case "warning": // validation
            return chalk.yellow("[!]");
          case "suggestion": // validation
            return chalk.blue("[i]");
          default:
            return chalk.yellow("[?]");
        }
      },
      "specIcon": function(severity, options) {
        switch (severity) {
          case "failed":
            return "❌️";
          case "passed":
            return "✅";
          default:
            return "❔";
        }
      },
      "consoleSpecIcon": function(severity, options) {
        switch (severity) {
          case "failed":
            return chalk.red("[X]");
          case "passed":
            return chalk.green("[Y]");
          default:
            return chalk.yellow("[?]");
        }
      },
      "firstLine": function(message, options) {
        return stripAnsi(message.split("\n")[0]);
      },
      "extractMessage": function(message, options) {
        const lines = message.split("\n").map(x => stripAnsi(x).trim());
        const messageLineIndex = lines.indexOf('Message:') + 1;
        return messageLineIndex !== 0 ? lines[messageLineIndex] : lines[0];
      },
      "ifEquals": function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      },
      "pluralise": function(str, number) {
        return str + (number == 1 ? '' : 's');
      },
      "json": function(data, options) {
        return JSON.stringify(data, null, 2);
      },
      "headers": function(data, options) {
        return ENABLE_HEADER_LOGGING && data && _.isObject(data.headers) ? `\n${Object.entries(data.headers).map(([k, v], i) => `* **${k}:** \`${JSON.stringify(v)}\`\n`).join('')}` : '';
      },
      /**
       * @param {string[]} suite
       * @param {string} type
       */
      "logsFor": (suite, type, options) => {
        let first = true;
        // this.logger is only defined in ReportGenerator
        let logs = /** @type {ReporterLogger} */(/** @type {any} */(this).logger)
          .logsFor(suite, type);
        let ret = "";
        for (let [i, value] of logs.entries()) {

          let result = options.fn(
            value,
            {
              data: {
                first: i === 0,
                last: i === (logs.length - 1),
                index: i,
                key: i,
              },
              blockParams: [value, i],
            },
          );

          ret += result;
        }

        return ret;
      },
      /**
       * @param {string[]} suite
       */
      "statusFor": (suite) => {
        // this.logger is only defined in ReportGenerator
        let status = /** @type {ReporterLogger} */(/** @type {any} */(this).logger)
          .statusFor(suite);
        return status;
      },
      "eachSorted": (context, options) => {
        var ret = "";
        Object.keys(context).sort().forEach(function(key) {
          ret = ret + options.fn(context[key]);
        })
        return ret;
      },
      /**
       * @param {string[]} suite
       * @returns {boolean}
       */
      doRenderSuite: (suite) => {
        // return true;
        if (!suite.find(name => name === FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME)) {
          return true;
        }
        /* This is the Feature Description Assertions meta test. Only render it
        if it has failed but everything else has succeeded.

        This is because it will confuse a normal Test Suite user to see
        information about this test, which is actually a "meta-test" i.e. it
        tests that the test itself was annotated in a way that matches the run
        profile. Therefore, the meta-test may fail if other tests fail, as this
        impacts the run profile. But this is not a useful piece of information.
        If all tests succeed and this meta-test fails, then the test is
        annotated incorrectly. */

        // this.logger is only defined in ReportGenerator
        return /** @type {ReporterLogger} */(/** @type {any} */(this).logger)
          .isSuiteTheOnlyFailure(suite);
      },
      /**
       * @param {string[]} suite
       * @returns {string}
       */
      maintainerInfo: (suite) => {
        // return `SUITE: ${suite.join(', ')}`;
        if (!suite.find(name => name === FEATURE_DESCRIPTION_ASSERTIONS_META_TEST_NAME)) {
          return '';
        }
        // This is the Feature Description Assertions meta test. TODO2 more
        // TODO use a more generic error message if we add more meta-tests.
        // Currently, we only meta-test `testInterfaceActions`.
        return `If you are NOT a Test Suite maintainer: this failure means that the there is an issue with the Test Suite test itself. Please [raise an issue on the Test Suite repository](https://github.com/openactive/openactive-test-suite/issues), attaching this full \`.html\` file.

If you ARE a Test Suite maintainer: this failure indicates that the test's \`testInterfaceActions\` param to \`FeatureHelper.describeFeature(..)\` does not match the actual Test Interface Actions that were used in the test.`;
      },
    };
  }

  get templateData () {
    return {};
  }

  /**
   * @returns {string}
   */
  get reportHtmlPath () {
    throw "Not Implemented";
  }

  async outputConsole () {
    try {
      let template = await this.getTemplate(`${this.templateName}-cli`);

      let data = chalk(template(this.templateData, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true,
        helpers: this.helpers,
      }));

      console.log(data);
    } catch (exception) {
      console.error("err", exception);
    }
  }

  async writeHtml () {
    let template = await this.getTemplate(`${this.templateName}.md`);

    let data = template(this.templateData, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
      helpers: this.helpers,
    });

    const converter = new showdown.Converter();
    converter.setOption('completeHTMLDocument', true);
    converter.setOption('moreStyling', true)
    converter.setOption('openLinksInNewWindow', true);
    const html = converter.makeHtml(data);

    await fs.writeFile(this.reportHtmlPath, html);
  }

  async report(silentOnConsole) {
    if (!silentOnConsole) await this.outputConsole();
    await this.writeHtml();
  }

  async getTemplate (name) {
    let file = await fs.readFile(
      __dirname + "/report-templates/" + name + ".handlebars", "utf8");
    return Handlebars.compile(file);
  };
}

class ReportGenerator extends BaseReportGenerator {
  constructor (logger) {
    super();

    this.logger = logger;
  }

  get templateName () {
    return "report";
  }

  get templateData () {
    return this.logger;
  }

  get reportHtmlPath () {
    return this.logger.htmlPath;
  }
}

class SummaryReportGenerator extends BaseReportGenerator {
  constructor (loggers, datasetJson, results, conformanceCertificateId) {
    super();
    this.loggers = new LoggerGroup(this, loggers);
    this.datasetJson = datasetJson;
    this.conformanceCertificateId = conformanceCertificateId;
    this.results = results;
  }

  static async getLoggersFromFiles () {
    let filenames = await fs.readdir(`${OUTPUT_PATH}json/`);

    let loggers = filenames.map((filename) => {
      // strip off file extension
      let name = filename.match(/^(.*)\..*?$/)[1];

      return new ReporterLogger(name);
    });

    await Promise.all(loggers.map((logger) => logger.load()));

    return loggers;
  }

  get summaryMeta () {
    return {
      'conformanceCertificateId': this.conformanceCertificateId,
      'dataset': this.datasetJson,
      'features': Object.values(this.templateData.opportunityTypeGroups).flatMap(({opportunityTypeName, featureGroups}) =>
        Object.values(featureGroups).map(({overallStatus, categoryIdentifier, featureIdentifier, implemented, loggers}) => ({
          opportunityTypeName,
          overallStatus,
          category: categoryIdentifier,
          identifier: featureIdentifier,
          implemented,
          'tests': Object.values(loggers).map(({ overallStatus, testIdentifier, metaLocalPath, numPassed, numFailed }) =>
          ({
            overallStatus,
            testIdentifier,
            metaLocalPath,
            numPassed,
            numFailed
          }))
        }))
      ),
    };
  }

  async writeSummaryMeta () {
    let json = JSON.stringify(this.summaryMeta, null, 2);

    await fs.writeFile(this.summaryMetaPath, json);
  }

  get templateName () {
    return "summary";
  }

  get templateData() {
    return this;
  }

  get testResultSummary () {
    return this.results;
  }

  get summaryMetaPath () {
    return `${OUTPUT_PATH}json/summary.json`;
  }

  get reportHtmlPath () {
    return `${OUTPUT_PATH}summary.html`;
  }

  get opportunityTypeGroups () {
    return this.loggers.opportunityTypeGroups;
  }

  get useRandomOpportunitiesMode() {
    return USE_RANDOM_OPPORTUNITIES ? 'Random' : 'Controlled';
  }

  get bookingServiceName() {
    return (this.datasetJson.bookingService && this.datasetJson.bookingService.name) || 
    (this.datasetJson.publisher && this.datasetJson.publisher.name);
  }

  get missingOpportunityDataSummary() {
    if (this._missingOpportunityDataSummary !== undefined) {
      return this._missingOpportunityDataSummary;
    }
    const { missingOpportunityDataSummary } = this.loggers;
    if (_.isEmpty(missingOpportunityDataSummary)) {
      return null;
    }
    this._missingOpportunityDataSummary = missingOpportunityDataSummary;
    return this._missingOpportunityDataSummary;
  }
}

class LoggerGroup {
  /**
   * @param {import('./helpers/logger').BaseLoggerType[]} loggers
   */
  constructor (reporter, loggers) {
    this.reporter = reporter;
    this.loggers = loggers;
  }

  get opportunityTypeGroups() {
    if (this._opportunityTypeGroups) return this._opportunityTypeGroups;

    return this._opportunityTypeGroups = _
      .chain(this.loggers)
      // @ts-expect-error logger.opportunityType and logger.bookingFlow are only defined when a logger is loaded from an output JSON
      .groupBy(logger => logger.opportunityType ? `${logger.bookingFlow} >> ${logger.opportunityType}` : "Generic")
      .mapValues(group => new LoggerGroup(this.reporter, group))
      .value();
  }

  get featureGroups () {
    if (this._featureGroups) return this._featureGroups;

    return this._featureGroups = _
      .chain(this.loggers)
      .groupBy(
        (logger) => [logger.config.testCategory, logger.config.testFeature, logger.implemented])
      .mapValues(loggers => new LoggerGroup(this.reporter, loggers))
      .value();
  }

  get opportunityTypeName() {
    return this.loggers[0].opportunityTypeName;
  }

  get featureName () {
    let logger = this.loggers[0];
    return [logger.categoryName, logger.featureName].join(" / ");
  }

  get categoryIdentifier () {
    let logger = this.loggers[0];
    return logger.testCategory;
  }

  get featureIdentifier () {
    let logger = this.loggers[0];
    return logger.testFeature;
  }

  get implemented () {
    return this.loggers[0].implemented;
  }

  get implementedDisplayLabel () {
    return this.loggers[0].implementedDisplayLabel;
  }

  get specStatusCounts () {
    return this.loggers
      .reduce((acc, logger) => {
        let counts = logger.specStatusCounts;
        for (let [key, value] of Object.entries(counts)) {
          acc[key] = (acc[key] || 0) + value;
        }
        return acc;
      }, /** @type {Record<string, number>} */({}));
  }

  get validationStatusCounts () {
    return this.loggers
      .reduce((acc, logger) => {
        let counts = logger.validationStatusCounts;
        for (let [key, value] of Object.entries(counts)) {
          acc[key] = (acc[key] || 0) + value;
        }
        return acc;
      }, /** @type {Record<string, number>} */({}));
  }

  get overallStatus () {
    let spec = this.specStatusCounts;
    let validation = this.validationStatusCounts;

    if (spec.failed > 0) return "failed";
    else if (validation.failure > 0) return "failed";
    // The line below adds an overall "warning" status if any warnings exist
    // Can add this back in when the validator warnings are more useful
    // else if (validation.warning > 0) return "warning";
    else return "passed";
  }

  /**
   * Get stats about which tests have OpportunityNotFound events and thus
   * failed due to missing required opportunity data.
   */
  get missingOpportunityDataStats() {
    if (this._missingOpportunityDataStats) { return this._missingOpportunityDataStats; }
    const allAugmentedEvents = this.loggers.flatMap((logger) => {
      const testConfig = _.pick(logger, [
        'opportunityTypeName',

        'featureName',
        'implementedDisplayLabel',
        'suiteName',
        'htmlLocalPath',
      ]);
      const flowStageLogs = Object.values(logger.flow);
      return flowStageLogs.flatMap(flowStageLog => (
        flowStageLog.events
          .filter(event => event.type === 'OpportunityNotFound')
          // Associate each of these events with a specific test
          .map(event => ({ ..._.omit(event, ['type']), testConfig }))
      ));
    });
    const uniqueAugmentedEvents = _.uniqWith(allAugmentedEvents, _.isEqual);
    this._missingOpportunityDataStats = uniqueAugmentedEvents;
    return this._missingOpportunityDataStats;
  }

  /**
   * Groups the results from `missingOpportunityDataStats` into something
   * that can be shown in the summary report.
   */
  get missingOpportunityDataSummary() {
    if (this._missingOpportunityDataSummary) { return this._missingOpportunityDataSummary; }
    const stats = this.missingOpportunityDataStats;
    // So that criteria are listed alphabetically in the summary report
    const statsSortedByCriteria = _.sortBy(stats, [
      'testOpportunityCriteria',
    ]);
    this._missingOpportunityDataSummary = statsSortedByCriteria.reduce((acc, event) => {
      if (!acc[event.testOpportunityCriteria]) {
        acc[event.testOpportunityCriteria] = {
          sellerIds: [],
          opportunityTypes: [],
          bookingFlows: [],
          numTestsFailing: 0,
        };
      }
      const summary = acc[event.testOpportunityCriteria];
      pushToSortedUniqueArray(summary.sellerIds, event.sellerId);
      pushToSortedUniqueArray(summary.opportunityTypes, event.opportunityType);
      pushToSortedUniqueArray(summary.bookingFlows, event.bookingFlow);
      summary.numTestsFailing += 1;
      return acc;
    }, /** @type {MissingOpportunityDataSummary} */({}));
    return this._missingOpportunityDataSummary;
  }
}

/**
 * Push an item to an array that is already sorted.
 *
 * The item will be inserted into the array at a position which maintains sort
 * order. If the item is already present in the array, it will not be added.
 *
 * ! Mutates `arr`
 *
 * @template T
 * @param {T[]} arr
 * @param {T} value
 */
function pushToSortedUniqueArray(arr, value) {
  const index = _.sortedIndex(arr, value);
  if (arr[index] === value) {
    return;
  }
  arr.splice(index, 0, value);
}

module.exports = {
  ReportGenerator,
  SummaryReportGenerator,
};
