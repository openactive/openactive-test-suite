const chai = require('chai');
const { OpenActiveOpenIdTestClient, recordWithIntercept } = require('@openactive/openactive-openid-test-client');

const { HEADLESS_AUTH } = global;

class OpenIDConnectFlow {
  constructor({ logger }) {
    this.logWithIntercept = async (...args) => await recordWithIntercept(entry => logger.recordLogEntry(entry), ...args);
    this.client = new OpenActiveOpenIdTestClient(global.MICROSERVICE_BASE);
    this.keys = {};
  }

  discover(discoveryUrl) {
    it('should complete Discovery successfully', async () => {
      // Discovery
      const issuer = await this.logWithIntercept('Discovery', () => this.client.discover(discoveryUrl));
      console.log('Discovered issuer %s %O\n\n', issuer.issuer, issuer.metadata);
    });
    return this;
  }

  register({ initialAccessToken }) {
    it('should complete Dynamic Client Registration successfully', async () => {
      // Dynamic Client Registration
      const { registration, clientId, clientSecret } = await this.logWithIntercept('Dynamic Client Registration', () => this.client.register(initialAccessToken));
      this.keys.clientId = clientId;
      this.keys.clientSecret = clientSecret;
      console.log('Dynamic Client Registration: %O\n\n', registration);
    });
    return this;
  }

  setClientCredentials({ clientId, clientSecret }) {
    this.keys.clientId = clientId;
    this.keys.clientSecret = clientSecret;
    return this;
  }

  authorizeAuthorizationCodeFlow({ username, password, offlineAccess = true, assertFlowRequiredConsent = null, title = '', authorizationParameters = undefined }) {
    let flowRequiredConsent;
    it('should complete Authorization Code Flow successfully', async () => {
      chai.expect(this.keys).to.have.property('clientId');
      chai.expect(this.keys).to.have.property('clientSecret');
      // Authorization Code Flow
      const { tokenSet, authorizationUrl, requiredConsent } = await this.logWithIntercept(`Authorization Code Flow${title ? ` (${title})` : ''}`, () => this.client.authorizeAuthorizationCodeFlow(this.keys.clientId, this.keys.clientSecret, {
        buttonSelector: '.btn-primary',
        headless: HEADLESS_AUTH,
        offlineAccess,
        username,
        password,
      }, authorizationParameters));
      flowRequiredConsent = requiredConsent;
      this.keys.refreshToken = tokenSet.refresh_token;
      console.log('Authorization Code Flow: Authorization URL: %s', authorizationUrl);
      console.log('Authorization Code Flow: received and validated tokens %j', tokenSet);
      console.log('Authorization Code Flow: validated ID Token claims %j', tokenSet.claims());
      console.log('Authorization Code Flow: received refresh token %s\n\n', tokenSet.refresh_token);
    });
    if (assertFlowRequiredConsent !== null) {
      it(`should ${!assertFlowRequiredConsent ? 'not ' : ''}require a consent prompt for Authorization Code Flow${title ? ` (${title})` : ''}`, async () => {
        chai.expect(flowRequiredConsent).to.equal(assertFlowRequiredConsent);
      });
    }
    return this;
  }

  clientCredentialsFlow() {
    it('should complete Client Credentials Flow successfully', async () => {
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
