const util = require('util');
const chalk = require("chalk");
const Handlebars = require("handlebars");
const fs = require("fs").promises;
const stripAnsi = require("strip-ansi");
const {ReporterLogger} = require("./helpers/logger");
const _ = require("lodash");
const { getConfigVarOrThrow } = require('./helpers/config-utils');
const { recursivelyObjectEntries } = require('./helpers/obj-utils');
const showdown = require('showdown');

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
      "logsFor": (suite, type, options) => {
        let first = true;
        let logs = this.logger.logsFor(suite, type);
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
      "statusFor": (suite) => {
        let status = this.logger.statusFor(suite);
        return status;
      },
      "eachSorted": (context, options) => {
        var ret = "";
        Object.keys(context).sort().forEach(function(key) {
          ret = ret + options.fn(context[key]);
        })
        return ret;
      },
    };
  }

  get templateData () {
    return {};
  }

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
    converter.setOption('openLinksInNewWindow', true)
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
    // console.log('\n\n\nsummaryMeta. STATE:', util.inspect(this, false, null, true), '\n\n\n');
    // const { missingOpportunityDataSummary } = this.loggers;
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
      // missingOpportunityDataSummary: _.isEmpty(missingOpportunityDataSummary)
      //   ? null
      //   : missingOpportunityDataSummary,
    };
  }

  async writeSummaryMeta () {
    let json = JSON.stringify(this.summaryMeta, null, 2);

    await fs.writeFile(this.summaryMetaPath, json);
  }

  get templateName () {
    return "summary";
  }

  // TODO2 actually we can revert this
  get templateData() {
    // if (this.missingOpportunityDataSummary === undefined) {
    //   this.missingOpportunityDataSummary = this.getMissingOpportunityDataSummary();
    // }
    // console.log('\n\n\nSummaryReportGenerator.templateData(): this:', this);
    return this;
    // return {
    //   ...this,
    //   // missingOpportunityDataSummary: this.getMissingOpportunityDataSummary(),
    // };
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
    console.log('get missingOpportunityDataSummary()');
    const { missingOpportunityDataSummary } = this.loggers;
    console.log('get missingOpportunityDataSummary() - missingOpportunityDataSummary:', missingOpportunityDataSummary);
    if (_.isEmpty(missingOpportunityDataSummary)) {
      console.log('get missingOpportunityDataSummary() - returning null');
      return null;
    }
    console.log('get missingOpportunityDataSummary() - returning not null');
    // Convert nested object to array of arrays for easier handling by handlebars
    this._missingOpportunityDataSummary = recursivelyObjectEntries(missingOpportunityDataSummary);
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
    return this.loggers[0].opportunityType ? (`${this.loggers[0].bookingFlow} >> ${this.loggers[0].opportunityType}`) : 'Generic';
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
      }, {});
  }

  get validationStatusCounts () {
    return this.loggers
      .reduce((acc, logger) => {
        let counts = logger.validationStatusCounts;
        for (let [key, value] of Object.entries(counts)) {
          acc[key] = (acc[key] || 0) + value;
        }
        return acc;
      }, {});
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
   * TODO2
   */
  get missingOpportunityDataStats() {
    if (this._missingOpportunityDataStats) { return this._missingOpportunityDataStats; }
    const allAugmentedEvents = this.loggers.flatMap((logger) => {
      // const testConfig = _.pick(logger.config, [
      //   'testCategory',
      //   'testFeature',
      //   'testFeatureImplemented',
      //   'testIdentifier',
      //   'testName',
      // ]);
      // const { featureName, implementedDisplayLabel, suiteName, htmlLocalPath } = logger;
      // /**
      //  * @type {{
      //  *   featureName: string;
      //  *   implementedDisplayLabel: string;
      //  *   suiteName: string;
      //  *   htmlLocalPath: string;
      //  * }}
      //  */
      const testConfig = _.pick(logger, [
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
    // Sort stats so that groupings are alphabetical and consistent in the
    // summary report.
    const sorted = _.sortBy(stats, [
      'testOpportunityCriteria',
      'opportunityType',
      'bookingFlow',
      'sellerId',
      'testConfig.featureName',
      'testConfig.implementedDisplayLabel',
      'testConfig.suiteName',
    ]);
    /**
     * @type {{
     *   [testOpportunityCriteria: string]: {
     *     [opportunityType: string]: {
     *       [bookingFlow: string]: {
     *         [sellerId: string]: Pick<import('./helpers/logger').BaseLoggerType, "featureName" | "implementedDisplayLabel" | "suiteName" | "htmlLocalPath">[];
     *       }
     *     }
     *   }
     * }}
     */
    const grouped = sorted.reduce((acc, event) => {
      const path = [
        event.testOpportunityCriteria,
        event.opportunityType,
        event.bookingFlow,
        event.sellerId,
      ];
      const { testConfig } = event;
      _.update(acc, path, (existing) => {
        if (!existing) {
          return [testConfig];
        }
        existing.push(testConfig);
        return existing;
      });
      return acc;
    }, {});
    this._missingOpportunityDataSummary = grouped;
    return this._missingOpportunityDataSummary;
  }
}

module.exports = {
  ReportGenerator,
  SummaryReportGenerator,
};
