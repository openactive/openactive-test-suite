/* eslint-disable no-use-before-define */
const { Issuer, generators } = require('openid-client');
const { default: axios } = require('axios');
const { SSL_OP_ALL } = require('constants');

function throwIfNoIssuer(issuer) {
  if (!issuer) throw new Error('Please run `discover()` before using this client, or pass an explicit issuer');
}

module.exports = class OpenActiveOpenIdTestClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.callbackUrl = `${baseUrl}/cb`;
    this.issuer = null;
  }

  /**
   * @param {string} identityServerUrl
   */
  async discover(identityServerUrl) {
    this.issuer = await Issuer.discover(identityServerUrl);
    return this.issuer;
  }

  /**
   * @param {string} initialAccessToken
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async register(initialAccessToken, issuer = this.issuer) {
    throwIfNoIssuer(issuer);

    const registration = await issuer.Client.register({
      redirect_uris: [this.callbackUrl],
      grant_types: ['authorization_code', 'refresh_token', 'client_credentials'],
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
      registration,
    };
  }

  /**
   * @typedef {Object} AuthorizeOptions
   * @property {string} buttonSelector
   * @property {boolean} headless
   */

  /**
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {AuthorizeOptions} options
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async authorizeAuthorizationCodeFlow(clientId, clientSecret, options, issuer = this.issuer) {
    throwIfNoIssuer(issuer);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [this.callbackUrl],
      response_types: ['code'],
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    });

    const codeVerifier = generators.codeVerifier();
    // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
    // it should be httpOnly (not readable by javascript) and encrypted.

    const codeChallenge = generators.codeChallenge(codeVerifier);

    const url = client.authorizationUrl({
      scope: 'openid openactive-openbooking offline_access',
      // resource: 'https://my.api.example.com/resource/32178',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // console.log('Test URL: %s', url);

    const { data: { callbackUrl, requiredAuthorisation } } = await axios.post(`${this.baseUrl}/browser-automation-for-auth`, {
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

    const tokenSet = await client.callback(this.callbackUrl, params, {
      code_verifier: codeVerifier,
    });

    if (!tokenSet.refresh_token) {
      throw new Error('Refresh token is required, but was not provided.');
    }

    return {
      tokenSet,
      requiredAuthorisation,
    };
  }

  /**
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async authorizeClientCredentialsFlow(clientId, clientSecret, issuer = this.issuer) {
    throwIfNoIssuer(issuer);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenSet = await client.grant({
      grant_type: 'client_credentials',
      scope: 'openactive-ordersfeed',
    });

    return {
      tokenSet,
    };
  }

  /**
   * @param {string} refreshToken
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async refresh(refreshToken, clientId, clientSecret, issuer = this.issuer) {
    throwIfNoIssuer(issuer);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });

    const refreshedTokenSet = await client.refresh(refreshToken);

    return refreshedTokenSet;
  }
};

/*
async function oauthReauthenticate() {
  const issuer = await Issuer.discover(IDENTITY_SERVER_URL);

  console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);

  const initialAccessToken = 'openactive_test_suite_client_12345xaq';
  const { clientId, clientSecret } = await register(issuer, initialAccessToken);
  const firstAuthorize = await authorizeAuthorizationCodeFlow(issuer, clientId, clientSecret, {
    buttonSelector: '.btn-primary',
    headless: false,
  });
  const secondAuthorize = await authorizeAuthorizationCodeFlow(issuer, clientId, clientSecret, {
    buttonSelector: '.btn-primary',
    headless: false,
  });
  assert(true, firstAuthorize.requiredAuthorisation);
  assert(false, secondAuthorize.requiredAuthorisation);
}
*/
