const nock = require('nock');

/**
 * @typedef {{
 *   type: 'request',
 *   stage: string,
 *   request: {[k: string]: unknown},
 *   response?: {[k: string]: unknown},
 *   isPending: boolean,
 *   duration: number
 * }} Entry
 */

/**
 * Intecept and log all http requests made during the execution of actionFn
 * @template TActionFnResult
 * @param {(Entry) => Entry} recordLogEntry
 * @param {string} stage
 * @param {() => TActionFnResult} actionFn
 * @returns {Promise<TActionFnResult>}
 */
async function recordWithIntercept(recordLogEntry, stage, actionFn) {
  /**
   * This log entry is mutated - it is updated as more information becomes available
   */
  const entry = recordLogEntry({
    type: 'request',
    stage,
    request: {
    },
    isPending: true,
    duration: 0,
  });

  // manually count how long it's been waiting
  // note this is copied from the logger within openactive-integration-tests
  // because process can terminated by Jest at any time, there is no hook to capture the end time
  const responseTimer = setInterval(() => {
    entry.duration += 100;
  }, 100);

  // Record all requests within actionFn
  nock.recorder.rec({
    output_objects: true,
    dont_print: true,
    enable_reqheaders_recording: true,
  });

  let actionError = null;

  /** @type {TActionFnResult} */
  let result = null;

  try {
    result = await actionFn();
  } catch (error) {
    actionError = error;
  } finally {
    clearInterval(responseTimer);
    entry.isPending = false;
  }

  // Store requests
  const nockCallObjects = /** @type {nock.Definition[]} */(nock.recorder.play()); // TS suggests this could also be string[]

  // Stop recording
  nock.recorder.clear();
  nock.restore();

  // Process requests
  const entries = nockCallObjects.map((httpCall, i) => {
    const thisEntry = {
      type: 'request',
      // Ensure stage names are unique
      stage: `${stage}${nockCallObjects.length > 1 ? ` - ${i + 1}` : ''}`,
      request: {
        method: httpCall.method,
        url: `${httpCall.scope}${httpCall.path}`,
        requestOptions: {
          headers: httpCall.reqheaders,
        },
      },
      response: {
        body: httpCall.response,
        // responseTime: (does not exist in nock)
        status: httpCall.status,
        headers: httpCall.headers,
      },
      isPending: false,
      duration: 0,
    };
    if (httpCall.body !== '') {
      thisEntry.request.jsonBody = httpCall.body;
    }
    return thisEntry;
  });

  if (entries.length > 0) {
    // Add any error message to the most recent entry
    if (actionError && entries.length > 0) entries.slice(-1)[0].response.error = actionError.message;

    // Overwrite the first entry (which has already been written to the log)
    entry.stage = entries[0].stage;
    entry.request = entries[0].request;
    entry.response = entries[0].response;

    // Add any additional entries
    entries.slice(1).forEach(recordLogEntry);
  } else if (actionError) {
    // If no entries have been generated, add any error message to the first entry
    entry.response = {
      error: actionError.message,
    };
  }

  if (actionError) {
    throw actionError;
  }

  return result;
}

/**
 * Intecept and output to the console all http requests made during the execution of actionFn
 * This is used primarily for the CLI
 * @template TActionFnResult
 * @param {string} stage
 * @param {() => TActionFnResult} actionFn
 */
async function logWithIntercept(stage, actionFn) {
  /**
   * These logs are mutated - they are updated after being added by recordWithIntercept
   */
  const logs = [];
  /**
   * @param {Entry} entry
   */
  const recordLogEntry = (entry) => {
    const log = {
      ...entry,
    };

    logs.push(log);

    return log;
  };
  let result;
  try {
    result = await recordWithIntercept(recordLogEntry, stage, actionFn);
  } finally {
    console.log(`${stage} requests: ${JSON.stringify(logs, null, 2)}`);
  }
  return result;
}

module.exports = {
  recordWithIntercept,
  logWithIntercept,
};
