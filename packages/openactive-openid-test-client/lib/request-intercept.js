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
 * @param {(Entry) => Entry} recordLogEntry
 * @param {string} stage
 * @param {function} actionFn
 */
async function recordWithIntercept(recordLogEntry, stage, actionFn) {
  const entry = recordLogEntry({
    type: 'request',
    stage,
    request: {
    },
    isPending: true,
    duration: 0,
  });

  // manually count how long it's been waiting
  // todo: capture a timestamp and hook into test state instead
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
      stage: `${stage}${nockCallObjects.length > 1 ? ` ${i + 1}` : ''}`,
      request: {
        method: httpCall.method,
        url: `${httpCall.scope}${httpCall.path}`,
        requestOptions: {
          headers: httpCall.reqheaders,
        },
      },
      response: {
        body: httpCall.response,
        // responseTime: response.responseTime,
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

    // Overwrite the first entry
    entry.stage = entries[0].stage;
    entry.request = entries[0].request;
    entry.response = entries[0].response;

    // Add any additional enteries
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

  // Ensure that destructuring of a null result does not fail
  return result || {
  };
}

/**
 * Intecept and output to the console all http requests made during the execution of actionFn
 * @param {string} stage
 * @param {function} actionFn
 */
async function logWithIntercept(stage, actionFn) {
  const logs = [];
  /**
   * @param {Entry} entry
   */
  const recordLogEntry = (entry) => {
    const log = {
      // FIXME where does testMeta come from?
      ...(this.testMeta),
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
