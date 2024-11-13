const chalk = require('chalk');

/* eslint-disable no-console */
const logError = (x) => console.error(chalk.cyanBright(x));
const logErrorDuringHarvest = (x) => console.error(chalk.cyanBright(`\n\n${x}\n\n\n\n\n\n\n\n\n`)); // Above the multibar output
const log = (x) => console.log(chalk.cyan(x));
/* eslint-enable no-console */
const logCharacter = (x) => process.stdout.write(chalk.cyan(x));

module.exports = {
  logError,
  logErrorDuringHarvest,
  log,
  logCharacter,
};
