const chalk = require('chalk');
const Handlebars = require('handlebars');
const pMemoize = require('p-memoize');
const fs = require('fs').promises;

class ReportGenerator {
  constructor(logger) {
    this.logger = logger;

    Handlebars.registerHelper("chalk", function() {
      const args = Array.prototype.slice.apply(arguments);
      const options = args.pop();

      //apply each arg one after another,
      // i.e. if provided with "bold", "red" we want `chalk.bold.red`
      const chalkFn = args.reduce(function(p,n){return p[n]}, chalk);

      return chalkFn(options.fn(this));
    });

    Handlebars.registerHelper("if", function(conditional, options) {
      if (options.hash.desired === options.hash.type) {
        options.fn(this);
      } else {
        options.inverse(this);
      }
    });

    Handlebars.registerHelper("validationIcon", function(severity, options) {
      switch (severity) {
        case "warning":
          return "⚠️";
        case "failure":
          return "❌️";
        case "suggestion":
          return "📝";
        default:
          return "❔";
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

    Handlebars.registerHelper("firstLine", function(message, options) {
      return message.split("\n")[0];
    });

    Handlebars.registerHelper("json", function(data, options) {
      return JSON.stringify(data, null, 4);
    });
  }

  getTemplate = pMemoize(async (name) => {
    let file = await fs.readFile(__dirname+'/report-templates/'+name+'.handlebars', 'utf8');
    return Handlebars.compile(file);
  });

  async outputConsole() {
    try {
      let template = await this.getTemplate('report-cli');

      let data = chalk(template(this.logger));

      console.log(data);
    }
    catch(exception) {
      console.error('err', exception);
    }
  }

  async writeMarkdown() {
    let template = await this.getTemplate('report.md');

    let data = template(this.logger);

    await fs.writeFile(`./output/${this.logger.testName}.md`, data);
  }

  async report() {
    await this.outputConsole();
    await this.writeMarkdown();
  }

}

module.exports = {
  ReportGenerator
};
