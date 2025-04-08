const chalk = require('chalk');

/* eslint-disable no-console */
const logError = (/** @type {unknown} */ x) => console.error(chalk.cyanBright(x));
const logErrorDuringHarvest = (/** @type {unknown} */ x) => console.error(chalk.cyanBright(`\n\n${x}\n\n\n\n\n\n\n\n\n`)); // Above the multibar output
const log = (/** @type {unknown} */ x) => console.log(chalk.cyan(x));
/* eslint-enable no-console */
const logCharacter = (/** @type {unknown} */ x) => process.stdout.write(chalk.cyan(x));

module.exports = {
  logError,
  logErrorDuringHarvest,
  log,
  logCharacter,
};
