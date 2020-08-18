const chalk = require("chalk");
const Handlebars = require("handlebars");
const fs = require("fs").promises;
const stripAnsi = require("strip-ansi");
const {ReporterLogger} = require("./helpers/logger");
const _ = require("lodash");
const config = require("config");
const USE_RANDOM_OPPORTUNITIES = config.get("useRandomOpportunities");
const OUTPUT_PATH = config.get('outputPath');

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

        return suiteName.slice(3).join(" >> ");
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
      "pluralise": function(str, number) {
        return str + (number == 1 ? '' : 's');
      },
      "json": function(data, options) {
        return JSON.stringify(data, null, 2);
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
      }
    };
  }

  get templateData () {
    return {};
  }

  get reportMarkdownPath () {
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

  async writeMarkdown () {
    let template = await this.getTemplate(`${this.templateName}.md`);

    let data = template(this.templateData, {
      allowProtoMethodsByDefault: true,
      allowProtoPropertiesByDefault: true,
      helpers: this.helpers,
    });

    await fs.writeFile(this.reportMarkdownPath, data);
  }

  async report () {
    await this.outputConsole();
    await this.writeMarkdown();
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

  get reportMarkdownPath () {
    return this.logger.markdownPath;
  }
}

class SummaryReportGenerator extends BaseReportGenerator {
  constructor (loggers, datasetJson, conformanceCertificateId) {
    super();
    this.loggers = new LoggerGroup(this, loggers);
    this.datasetJson = datasetJson;
    this.conformanceCertificateId = conformanceCertificateId;
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
        )
    };
  }

  async writeSummaryMeta () {
    let json = JSON.stringify(this.summaryMeta, null, 2);

    await fs.writeFile(this.summaryMetaPath, json);
  }

  get templateName () {
    return "summary";
  }

  get templateData () {
    return this;
  }

  get summaryMetaPath () {
    return `${OUTPUT_PATH}json/summary.json`;
  }

  get reportMarkdownPath () {
    return `${OUTPUT_PATH}summary.md`;
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
}

class LoggerGroup {
  constructor (reporter, loggers) {
    this.reporter = reporter;
    this.loggers = loggers;
  }

  get opportunityTypeGroups() {
    if (this._opportunityTypeGroups) return this._opportunityTypeGroups;

    return this._opportunityTypeGroups = _
      .chain(this.loggers)
      .groupBy(logger => logger.opportunityType || "Generic")
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
    return this.loggers[0].opportunityType || "Generic";
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

}

module.exports = {
  ReportGenerator,
  SummaryReportGenerator,
};
