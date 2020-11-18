const { Issuer, generators } = require('openid-client');
const { default: axios } = require('axios');
const sleep = require('util').promisify(setTimeout);

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
   * @param {string} authenticationAuthority
   */
  async discover(authenticationAuthority) {
    // Only allow discovery of /.well-known/openid-configuration
    this.issuer = await Issuer.discover(`${authenticationAuthority}/.well-known/openid-configuration`);
    return this.issuer;
  }

  /**
   * @param {string} initialAccessToken
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async register(initialAccessToken, issuer = this.issuer) {
    throwIfNoIssuer(issuer);

    // @ts-ignore I think this is because of an issue with openid-client's types where Client
    // isn't properly exposed as being the Client class but rather just an function which
    // can be used to instantiate Client instances.
    const registration = await issuer.Client.register({
      redirect_uris: [this.callbackUrl],
      grant_types: ['authorization_code', 'refresh_token', 'client_credentials'],
      client_name: 'OpenActive Test Suite Client',
      client_uri: 'https://github.com/openactive/openactive-test-suite',
      logo_uri: 'https://via.placeholder.com/512x256.png?text=Logo',
      scope: 'openid profile openactive-openbooking openactive-ordersfeed oauth-dymamic-client-update openactive-identity',
      // id_token_signed_response_alg (default "RS256")
      // token_endpoint_auth_method (default "client_secret_basic")
    }, {
      initialAccessToken,
    });

    // Always wait 500ms after registration, to give the auth server time to catch up
    await sleep(500);

    return {
      clientId: registration.client_id,
      clientSecret: registration.client_secret,
      registration,
    };
  }

  /**
   * @typedef {object} AuthorizeOptions
   * @property {boolean} headless
   * @property {boolean} [offlineAccess]
   * @property {string} username
   * @property {string} password
   */

  /**
   * @param {string} clientId
   * @param {string} clientSecret
   * @param {AuthorizeOptions} options
   * @param {import('openid-client').AuthorizationParameters} authorizationParameters
   * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
   */
  async authorizeAuthorizationCodeFlow(
    clientId,
    clientSecret,
    options,
    authorizationParameters = {
    },
    issuer = this.issuer,
  ) {
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

    const authParams = {
      scope: 'openid openactive-openbooking offline_access openactive-identity',
      ...authorizationParameters,
      // resource: 'https://my.api.example.com/resource/32178',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    };

    const url = client.authorizationUrl(authParams);

    const { data: { callbackUrl, requiredConsent } } = await axios.post(`${this.baseUrl}/browser-automation-for-auth`, {
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

    if (!tokenSet.refresh_token && authParams.scope.indexOf('offline_access') > -1) {
      throw new Error('Refresh token is required, but was not provided.');
    }

    return {
      authorizationUrl: url,
      tokenSet,
      requiredConsent,
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
