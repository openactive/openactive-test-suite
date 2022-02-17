/**
 * TODO TODO doc
 */
const { execPipe, take, toArray, map } = require('iter-tools');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const R = require('ramda');
const { Worker } = require('worker_threads');
const { VALIDATOR_INPUT_TMP_DIR } = require('./broker-config');

/**
 * @typedef {import('./validatorWorker').ValidatorWorkerResponse} ValidatorWorkerResponse
 */

const TIME_TO_WAIT_IF_NO_INPUTS_MS = 1000;
const MAX_NUM_EXAMPLES_PER_VALIDATION_RESULT = 5;

const numCpus = os.cpus().length;
const numWorkers = numCpus;
const workerFileName = path.join(__dirname, 'validatorWorker.js');

const validatorInputFileNameComparator = R.ascend(getValidatorInputFileNameSequenceNumber);

class ValidatorWorkerPool {
  /**
   * @param {(feedContextIdentifier: string, numItems: number) => void} onValidateItems
   */
  constructor(onValidateItems) {
    /**
     * @type {Map<string, {
     *   path: string;
     *   message: string;
     *   occurrences: number;
     *   examples: any[];
     * }>}
     */
    this._validationResults = new Map();
    this._isRunning = true;
    this._onValidateItems = onValidateItems;
  }

  stop() {
    this._isRunning = false;
  }

  /**
   * TODO TODO doc
   *
   * You probably don't want to `await` this. The await will finish at a rather arbitrary time which is after
   * the first iteration.
   */
  async run() {
    if (!this._isRunning) { return; }
    // Get a batch of files to validate
    const allFileNames = await fs.readdir(VALIDATOR_INPUT_TMP_DIR);
    if (allFileNames.length === 0) {
      // Check again in a bit
      setTimeout(() => this.run(), TIME_TO_WAIT_IF_NO_INPUTS_MS);
      return;
    }
    allFileNames.sort(validatorInputFileNameComparator);
    const filePaths = execPipe(allFileNames,
      take(numWorkers),
      map((fileName) => path.join(VALIDATOR_INPUT_TMP_DIR, fileName)),
      toArray);
    // Farm off to workers to validate
    await Promise.all(filePaths.map((filePath) => (
      this._validateFileWithWorker(filePath))));
    // Remove now validated files
    await Promise.all(filePaths.map(async (filePath) => {
      await fs.rm(filePath, {
        force: true,
      });
    }));
    // Check again immediately
    setImmediate(() => this.run());
  }

  /**
   * @param {string} filePath
   */
  async _validateFileWithWorker(filePath) {
    const fileData = await fs.readFile(filePath);
    const worker = new Worker(workerFileName, {
      workerData: fileData.toString(),
    });
    await new Promise((resolve, reject) => {
      worker.on('message', (/** @type {ValidatorWorkerResponse} */message) => {
        /*  */
        for (const { opportunityId, error } of message.errors) {
          this._processValidationError(opportunityId, error);
        }
        // Inform Broker that some items have been validated (so it can update its progress bars)
        for (const [feedContextIdentifier, numItems] of Object.entries(message.numItemsPerFeed)) {
          this._onValidateItems(feedContextIdentifier, numItems);
        }
        resolve();
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Prepare validation results for eventual render. This involves a compression, which is essential to make the
   * results readable and to minimise memory usage, as there can be a vast number of errors.
   *
   * @param {string} opportunityId
   * @param {any} validationError
   */
  _processValidationError(opportunityId, validationError) {
    // Use the first line of the error message to uniquely identify it
    const errorShortMessage = validationError.message.split('\n')[0];
    const errorKey = `${validationError.path}: ${errorShortMessage}`;

    // Create a new entry if this is a new error
    let currentValidationResults = this._validationResults.get(errorKey);
    if (!currentValidationResults) {
      currentValidationResults = {
        path: validationError.path,
        message: errorShortMessage,
        occurrences: 0,
        examples: [],
      };
      this._validationResults.set(errorKey, currentValidationResults);
    }

    // Keep track of examples of each error, with a preference for newer ones (later in the feed)
    currentValidationResults.occurrences += 1;
    currentValidationResults.examples.unshift(opportunityId);
    if (currentValidationResults.examples.length > MAX_NUM_EXAMPLES_PER_VALIDATION_RESULT) {
      currentValidationResults.examples.pop();
    }
  }
}

/**
 * @param {string} fileName
 */
function getValidatorInputFileNameSequenceNumber(fileName) {
  return Number(path.basename(fileName, '.json'));
}

module.exports = {
  ValidatorWorkerPool,
};
