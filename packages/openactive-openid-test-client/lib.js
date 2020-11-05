/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
const { Issuer, generators } = require('openid-client');
const config = require('config');
const { default: axios } = require('axios');
const { assert } = require('console');

const nock = require('nock');

const IDENTITY_SERVER_URL = config.get('identityServerUrl');

const MICROSERVICE_BASE_URL = 'http://localhost:3000';

const CALLBACK_URL = `${MICROSERVICE_BASE_URL}/cb`;

/**
 * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
 * @param {string} initialAccessToken
 */
async function register(issuer, initialAccessToken) {
  const registration = await issuer.Client.register({
    redirect_uris: [CALLBACK_URL],
    grant_types: ['authorization_code', 'refresh_token'],
    client_name: 'OpenActive Test Suite Client',
    client_uri: 'https://client.example.org/',
    logo_uri: 'https://client.example.org/newlogo.png',
    scope: 'openid profile openactive-openbooking openactive-ordersfeed oauth-dymamic-client-update openactive-identity',
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
  }, {
    initialAccessToken,
  });

  return {
    clientId: registration.client_id,
    clientSecret: registration.client_secret,
  };
}

/**
 * @typedef {Object} AuthorizeOptions
 * @property {string} buttonSelector
 * @property {boolean} headless
 */

/**
 * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {AuthorizeOptions} options
 */
async function authorize(issuer, clientId, clientSecret, options) {
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [CALLBACK_URL],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
  });

  const codeVerifier = generators.codeVerifier();
  // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
  // it should be httpOnly (not readable by javascript) and encrypted.

  const codeChallenge = generators.codeChallenge(codeVerifier);

  const url = client.authorizationUrl({
    scope: 'openid openactive-openbooking oauth-dymamic-client-update offline_access openactive-identity',
    // resource: 'https://my.api.example.com/resource/32178',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  console.log('Test URL: %s', url);

  const { data: { callbackUrl, requiredAuthorisation } } = await axios.post(`${MICROSERVICE_BASE_URL}/browser-automation-for-auth`, {
    ...options,
    authorizationUrl: url,
  }).catch((err) => {
    const { response: { data: { error }, status } } = err;
    if (status === 400 && error) {
      throw new Error(error);
    } else {
      throw err;
    }
  });

  const params = client.callbackParams(callbackUrl);

  const tokenSet = await client.callback(CALLBACK_URL, params, {
    code_verifier: codeVerifier,
  });

  console.log('received and validated tokens %j', tokenSet);
  console.log('validated ID Token claims %j', tokenSet.claims());
  console.log('received refresh token %s', tokenSet.refresh_token);

  return {
    tokenSet,
    requiredAuthorisation,
  };
}

/**
 * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string} refreshToken
 */
async function refresh(issuer, clientId, clientSecret, refreshToken) {
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
  });

  const refreshedTokenSet = await client.refresh(refreshToken);
  console.log('refreshed and validated tokens %j', refreshedTokenSet);
  console.log('refreshed ID Token claims %j', refreshedTokenSet.claims());

  return refreshedTokenSet;
}

const logs = [];

async function oauthAuthenticate() {
  try {
    const issuer = await recordWithIntercept('Discovery', Issuer.discover, IDENTITY_SERVER_URL);

    console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

    const initialAccessToken = 'openactive_test_suite_client_12345xaq';
    const { clientId, clientSecret } = await recordWithIntercept('Dynamic Client Registration', register, issuer, initialAccessToken);
    const { tokenSet } = await recordWithIntercept('Authorization Code Flow', authorize, issuer, clientId, clientSecret, {
      buttonSelector: '.btn-primary',
      headless: true,
    });
    const refreshToken = tokenSet.refresh_token;
    const refreshedTokenSet = await await recordWithIntercept('Refresh Token', refresh, issuer, clientId + 's', clientSecret, refreshToken);
  } finally {
    console.log(`Logs: ${JSON.stringify(logs, null, 2)}`);
  }
}

function recordLogEntry(entry) {
  const log = {
    ...entry,
  };

  logs.push(log);

  return log;
}

async function recordWithIntercept(stage, actionFn, ...args) {
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
    result = await actionFn(...args);
  } catch (error) {
    actionError = error;
  } finally {
    clearInterval(responseTimer);
    entry.isPending = false;
  }

  // Store requests
  const nockCallObjects = nock.recorder.play();

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
          headers: httpCall.reqheader,
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
  return result;
}

async function oauthReauthenticate() {
  const issuer = await Issuer.discover(IDENTITY_SERVER_URL);

  console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

  const initialAccessToken = 'openactive_test_suite_client_12345xaq';
  const { clientId, clientSecret } = await register(issuer, initialAccessToken);
  const firstAuthorize = await authorize(issuer, clientId, clientSecret, {
    buttonSelector: '.btn-primary',
    headless: false,
  });
  const secondAuthorize = await authorize(issuer, clientId, clientSecret, {
    buttonSelector: '.btn-primary',
    headless: false,
  });
  assert(true, firstAuthorize.requiredAuthorisation);
  assert(false, secondAuthorize.requiredAuthorisation);
}

module.exports = {
  register,
  authorize,
  refresh,
  oauthAuthenticate,
};
