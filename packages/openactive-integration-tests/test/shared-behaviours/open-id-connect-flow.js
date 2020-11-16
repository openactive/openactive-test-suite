const chai = require('chai');
const config = require('config');
const { OpenActiveOpenIdTestClient, recordWithIntercept } = require('@openactive/openactive-openid-test-client');

const { HEADLESS_AUTH, BOOKING_PARTNER_CONFIG, AUTHENTICATION_AUTHORITY } = global;
const BOOKING_PARTNER_SPECIFIC_CONFIG = config.has('bookingPartnersForSpecificTests') ? config.get('bookingPartnersForSpecificTests') : {};
const ENABLE_HEADER_LOGGING = config.get('requestHeaderLogging');

function throwIfNoAuthenticationAuthority() {
  if (!AUTHENTICATION_AUTHORITY) {
    throw new Error('`accessService.authenticationAuthority` not found within dataset site');
  }
}

class OpenIDConnectFlow {
  constructor({ logger }) {
    this.logWithIntercept = async (...args) => await recordWithIntercept((entry) => logger.recordLogEntry(entry), ...args);
    this.logger = logger;
    this.client = new OpenActiveOpenIdTestClient(global.MICROSERVICE_BASE);
    /**
     * Keys are maintained between stages of the flow
     * @type {{
     *   clientId?: string,
     *   clientSecret?: string,
     *   refreshToken?: string,
     * }}
     */
    this.keys = {};
  }

  discover() {
    it('should complete Discovery successfully', async () => {
      throwIfNoAuthenticationAuthority();
      // Discovery
      const issuer = await this.logWithIntercept('Discovery', () => this.client.discover(AUTHENTICATION_AUTHORITY));
      console.log('Discovered issuer %s %O\n\n', issuer.issuer, issuer.metadata);
    });
    return this;
  }

  register(specificConfig, clientCredentialsKey) {
    it('should complete Dynamic Client Registration successfully', async () => {
      throwIfNoAuthenticationAuthority();
      const configSource = specificConfig ? BOOKING_PARTNER_SPECIFIC_CONFIG : BOOKING_PARTNER_CONFIG;
      const configSourceName = specificConfig ? 'bookingPartnersForSpecificTests' : 'bookingPartners';
      const { initialAccessToken } = configSource?.[clientCredentialsKey]?.authentication ?? {};
      this.logger.recordLogMessage(`Credentials${initialAccessToken ? '' : ' Not Found (!)'}`, `
The test suite is ${initialAccessToken ? 'using' : 'attempting to use'} Dynamic Client Registration to retrieve credentials as part of this test, using the following configuration within \`${configSourceName}.${clientCredentialsKey}.authentication\`:
* **initialAccessToken**: \`${ENABLE_HEADER_LOGGING ? initialAccessToken : "<please enable 'requestHeaderLogging' to expose credentials>"}\`

${initialAccessToken ? 'Hence the `client_id` and `client_secret` can be found within the Dynamic Client Registration response below.'
    : `Please ensure \`${configSourceName}.${clientCredentialsKey}.authentication.initialAccessToken\` exists in the configuration.`}

      `);

      // Dynamic Client Registration
      const { registration, clientId, clientSecret } = await this.logWithIntercept('Dynamic Client Registration', () => this.client.register(initialAccessToken));
      this.keys.clientId = clientId;
      this.keys.clientSecret = clientSecret;
      console.log('Dynamic Client Registration: %O\n\n', registration);
    });
    return this;
  }

  setClientCredentials(specificConfig, clientCredentialsKey) {
    beforeAll(() => {
      const configSource = specificConfig ? BOOKING_PARTNER_SPECIFIC_CONFIG : BOOKING_PARTNER_CONFIG;
      const configSourceName = specificConfig ? 'bookingPartnersForSpecificTests' : 'bookingPartners';
      const { clientId, clientSecret } = configSource?.[clientCredentialsKey]?.authentication?.clientCredentials ?? {};
      const { initialAccessToken } = configSource?.[clientCredentialsKey]?.authentication ?? {};
      this.keys.clientId = clientId;
      this.keys.clientSecret = clientSecret;
      this.logger.recordLogMessage(`Credentials${clientId && clientSecret ? '' : ' Not Found (!)'}`, `
The test suite is ${clientId && clientSecret ? 'using' : 'attempting to use'} the credentials ${initialAccessToken ? 'below' : `configured by \`${configSourceName}.${clientCredentialsKey}.authentication.clientCredentials\``} for this test:
* **clientId**: \`${ENABLE_HEADER_LOGGING ? clientId : "<please enable 'requestHeaderLogging' to expose credentials>"}\`
* **clientSecret**: \`${ENABLE_HEADER_LOGGING ? clientSecret : "<please enable 'requestHeaderLogging' to expose credentials>"}\`
${initialAccessToken ? `
These credentials ${clientId && clientSecret ? 'were' : 'should have been'} retrieved using Dynamic Client Registration by the Broker Microservice upon startup, using the following configuration within \`${configSourceName}.${clientCredentialsKey}.authentication\`:
* **initialAccessToken**: \`${ENABLE_HEADER_LOGGING ? initialAccessToken : "<please enable 'requestHeaderLogging' to expose credentials>"}\`
` : ''}
${clientId && clientSecret ? '' : `
Please ensure \`${configSourceName}.${clientCredentialsKey}.authentication.clientCredentials\` exists in the configuration.`}

`);
    });
    return this;
  }

  authorizeAuthorizationCodeFlow({ loginCredentialsAccessor, offlineAccess = true, assertFlowRequiredConsent = null, title = '', authorizationParameters = undefined }) {
    const flowState = {
      requiredConsent: null,
    };
    it('should complete Authorization Code Flow successfully', async () => {
      throwIfNoAuthenticationAuthority();
      const { username, password } = loginCredentialsAccessor();
      chai.expect(this.keys).to.have.property('clientId');
      chai.expect(this.keys).to.have.property('clientSecret');
      // Authorization Code Flow
      const { tokenSet, authorizationUrl, requiredConsent } = await this.logWithIntercept(`Authorization Code Flow${title ? ` (${title})` : ''}`, () => this.client.authorizeAuthorizationCodeFlow(this.keys.clientId, this.keys.clientSecret, {
        headless: HEADLESS_AUTH,
        offlineAccess,
        username,
        password,
      }, authorizationParameters));
      flowState.requiredConsent = requiredConsent;
      if (tokenSet.refresh_token) this.keys.refreshToken = tokenSet.refresh_token;
      console.log('Authorization Code Flow: Authorization URL: %s', authorizationUrl);
      console.log('Authorization Code Flow: received and validated tokens %j', tokenSet);
      console.log('Authorization Code Flow: validated ID Token claims %j', tokenSet.claims());
      console.log('Authorization Code Flow: received refresh token %s\n\n', tokenSet.refresh_token);
    });
    if (assertFlowRequiredConsent !== null) {
      it(`should ${!assertFlowRequiredConsent ? 'not ' : ''}require a consent prompt for Authorization Code Flow${title ? ` (${title})` : ''}`, async () => {
        throwIfNoAuthenticationAuthority();
        chai.expect(flowState.requiredConsent).to.equal(assertFlowRequiredConsent);
      });
    }
    return this;
  }

  clientCredentialsFlow() {
    it('should complete Client Credentials Flow successfully', async () => {
      throwIfNoAuthenticationAuthority();
      chai.expect(this.keys).to.have.property('clientId');
      chai.expect(this.keys).to.have.property('clientSecret');
      // Client Credentials Flow
      const { tokenSet: clientCredentialsTokenSet } = await this.logWithIntercept('Client Credentials Flow', () => this.client.authorizeClientCredentialsFlow(this.keys.clientId, this.keys.clientSecret));
      console.log('Client Credentials Flow: received and validated tokens %j\n\n', clientCredentialsTokenSet);
    });
    return this;
  }

  refresh() {
    it('should complete token refresh successfully', async () => {
      throwIfNoAuthenticationAuthority();
      chai.expect(this.keys).to.have.property('clientId');
      chai.expect(this.keys).to.have.property('clientSecret');
      chai.expect(this.keys).to.have.property('refreshToken');
      // Refresh Token
      const refreshedTokenSet = await this.logWithIntercept('Refresh Token', () => this.client.refresh(this.keys.refreshToken, this.keys.clientId, this.keys.clientSecret));
      console.log('refreshed and validated tokens %j', refreshedTokenSet);
      console.log('refreshed ID Token claims %j\n\n', refreshedTokenSet.claims());
    });
    return this;
  }
}

module.exports = {
  OpenIDConnectFlow,
};
