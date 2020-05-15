const chalk = require("chalk");
const Handlebars = require("handlebars");
const pMemoize = require("p-memoize");
const fs = require("fs").promises;
const stripAnsi = require("strip-ansi");
const {ReporterLogger} = require("./helpers/logger");
const _ = require("lodash");

class BaseReportGenerator {
  setupHelpers () {

  }

  get templateName () {
    return "report";
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

    Handlebars.registerHelper("chalk", function() {
      const args = Array.prototype.slice.apply(arguments);
      const options = args.pop();

      //apply each arg one after another,
      // i.e. if provided with "bold", "red" we want `chalk.bold.red`
      const chalkFn = args.reduce(function(p, n) {return p[n];}, chalk);

      return chalkFn(options.fn(this));
    });

    Handlebars.registerHelper("renderSuiteName", function(suiteName, options) {
      if (suiteName.length <= 2) return "Test setup";

      return suiteName.slice(3).join(" >> ");
    });

    Handlebars.registerHelper("validationIcon", function(severity, options) {
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
    });

    Handlebars.registerHelper("consoleValidationIcon",
      function(severity, options) {
        switch (severity) {
          case "passed": // spec
            return chalk.green("[√]");
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
      });

    Handlebars.registerHelper("specIcon", function(severity, options) {
      switch (severity) {
        case "failed":
          return "❌️";
        case "passed":
          return "✅";
        default:
          return "❔";
      }
    });

    Handlebars.registerHelper("consoleSpecIcon", function(severity, options) {
      switch (severity) {
        case "failed":
          return chalk.red("[X]");
        case "passed":
          return chalk.green("[√]");
        default:
          return chalk.yellow("[?]");
      }
    });

    Handlebars.registerHelper("firstLine", function(message, options) {
      return stripAnsi(message.split("\n")[0]);
    });

    Handlebars.registerHelper("json", function(data, options) {
      return JSON.stringify(data, null, 4);
    });

    Handlebars.registerHelper("logsFor", (suite, type, options) => {
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
    });
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
  constructor (loggers) {
    super();
    this.loggers = new LoggerGroup(this, loggers);
  }

  static async loadFiles () {
    let filenames = await fs.readdir(`./output/json/`);

    let loggers = filenames.map((filename) => {
      // strip off file extension
      let name = filename.match(/^(.*)\..*?$/)[1];

      return new ReporterLogger(name);
    });

    await Promise.all(loggers.map((logger) => logger.load()));

    return new SummaryReportGenerator(loggers);
  }

  get templateName () {
    return "summary";
  }

  get templateData () {
    return this;
  }

  get reportMarkdownPath () {
    return "./output/summary.md";
  }

  get opportunityTypeGroups () {
    return this.loggers.opportunityTypeGroups;
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
    return [logger.config.testCategory, logger.config.testFeature].join("/");
  }

  get implemented () {
    return this.loggers[0].implemented;
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
    else if (validation.warning > 0) return "warning";
    else return "passed";
  }

}

module.exports = {
  ReportGenerator,
  SummaryReportGenerator,
};
