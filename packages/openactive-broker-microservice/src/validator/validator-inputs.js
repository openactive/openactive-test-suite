/**
 * TODO TODO doc module and functions herein
 */
const fs = require('fs').promises;
const fsExtra = require('fs-extra');
const itertools = require('iter-tools');
const mkdirp = require('mkdirp');
const path = require('path');
const { ITEM_VALIDATION_MODE, VALIDATOR_INPUT_TMP_DIR } = require('../broker-config');

/**
 * A chunk length of 500 gives a memory usage by Validator Workers of roughly up to 4kb * 500 * <NUM CORES>.
 *
 * - A rough average size of medium-size (e.g. SessionSeries rather than ScheduledSession) OpenActive items
 *   (uncompressed) is about 2-4kb.
 * - So, with 8 cores, the memory usage will be roughly up to 4kb * 500 * 8 = 16MB, which is acceptable.
 * - To clarify, this is the memory usage of just holding this data in memory. This is not counting the additional
 *   memory usage required by validator's mechanisms.
 *
 * The flipside is that this results in a number of validator-input files created that is roughly:
 *
 * - <NUM UPDATED ITEMS IN FEEDS> / 500
 * - This would happen if validator took so long to run that all the input files accumulated before it had run even
 *   once.
 * - So, with 1M items (as a very high example!) in the feeds, this could result in 2,000 files. This also seems
 *   acceptably unlikely to cause issues (e.g. inode usage issues).
 */
const VALIDATOR_ITEMS_CHUNK_LENGTH = 500;

let validatorInputFilenameSequenceNum = 0;

async function setUpValidatorInputs() {
  await mkdirp(VALIDATOR_INPUT_TMP_DIR);
  // Clear this directory of any files which may not have been cleaned up in a prior run
  await clearValidatorInputTmpDir();
}

async function cleanUpValidatorInputs() {
  // Once validator has stopped, we may as well clean this directory to free up storage space
  await clearValidatorInputTmpDir();
}

/**
 * @param {string} feedContextIdentifier
 * @param {any[]} items RPDE items
 * @returns {Promise<number>} Number of items which have become queued for Validation
 */
async function createAndSaveValidatorInputsFromRpdePage(feedContextIdentifier, items) {
  const updatedItems = items.filter((item) => item.state === 'updated');
  /* When re-harvesting the feed frequently during development, this can speed up the process. However, note
  that leaving this on may allow Broker to miss some critical issues which will cause confusing errors later down
  the line */
  if (process.env.DEBUG_BROKER_NO_VALIDATE === 'true') {
    return updatedItems.length;
  }
  const validatorInputs = itertools.execPipe(updatedItems,
    itertools.map((item) => /** @type {import('.//types').ValidatorWorkerRequestParsedItem} */({
      item: item.data,
      validationMode: ITEM_VALIDATION_MODE,
      feedContextIdentifier,
    })),
    // TODO TODO doc here
    itertools.batch(VALIDATOR_ITEMS_CHUNK_LENGTH),
    itertools.map((chunkOfItems) => JSON.stringify([...chunkOfItems])),
    itertools.toArray);
  await Promise.all(validatorInputs.map(async (validatorInput) => {
    validatorInputFilenameSequenceNum += 1;
    await fs.writeFile(
      path.join(VALIDATOR_INPUT_TMP_DIR, `${validatorInputFilenameSequenceNum}.json`),
      validatorInput,
    );
  }));
  return updatedItems.length;
}

async function clearValidatorInputTmpDir() {
  await fsExtra.emptyDir(VALIDATOR_INPUT_TMP_DIR);
}

module.exports = {
  setUpValidatorInputs,
  cleanUpValidatorInputs,
  createAndSaveValidatorInputsFromRpdePage,
};
