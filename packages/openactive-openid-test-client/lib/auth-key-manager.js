const sleep = require('util').promisify(setTimeout);

/* eslint-disable no-console */
const FatalError = require('./fatal-error');
const OpenActiveOpenIdTestClient = require('./client');
/**
 * Auth key manager for use by tests
 */

module.exports = class OpenActiveTestAuthKeyManager {
  constructor(log, baseUrl, sellersConfig, bookingPartnerConfig) {
    this.log = log;
    // TODO: Improve deep copy
    this.sellersConfig = JSON.parse(JSON.stringify(sellersConfig));
    this.bookingPartnersConfig = JSON.parse(JSON.stringify(bookingPartnerConfig));
    this.client = new OpenActiveOpenIdTestClient(baseUrl);
    this.authenticationFailure = false;
    this.dynamicRegistrationFailure = false;
  }

  get config() {
    this.updateAccessTokens();
    return {
      sellersConfig: this.sellersConfig,
      bookingPartnersConfig: this.bookingPartnersConfig,
      authenticationFailure: this.authenticationFailure,
      dynamicRegistrationFailure: this.dynamicRegistrationFailure,
    };
  }

  async initialise(authenticationAuthority, headlessAuth = true) {
    try {
      if (!authenticationAuthority) {
        throw new FatalError('authenticationAuthority must be provided');
      }

      // Authenticate booking partners
      const bookingPartners = Object.entries(this.bookingPartnersConfig).filter(([, s]) => s.authentication);
      if (bookingPartners.length === 0) {
        this.log('Warning: Booking partner configuration not found');
        return;
      }

      // Is dynamic registration enabled?
      const useDynamicRegistration = Object.entries(this.bookingPartnersConfig).some(([, s]) => s.authentication && s.authentication.initialAccessToken);

      this.log(`\nAuthenticating using OpenID Connect with issuer '${authenticationAuthority}' with dynamic registration ${useDynamicRegistration ? 'enabled' : 'disabled'}...`);
      try {
        const issuer = await this.client.discover(authenticationAuthority);
        this.log(`Discovered OpenID Connect issuer '${issuer.issuer}'`);
      } catch (error) {
        this.log(`Error discovering OpenID Connect issuer '${authenticationAuthority}'`);
        if (useDynamicRegistration) this.dynamicRegistrationFailure = true;
        throw error;
      }

      await Promise.all(Object.entries(this.bookingPartnersConfig).map(async ([bookingPartnerIdentifier, bookingPartner]) => {
        // Ensure structure of config is correct
        const authenticationConfig = bookingPartner.authentication;
        if (authenticationConfig.clientCredentials && !(authenticationConfig.clientCredentials.clientId && authenticationConfig.clientCredentials.clientSecret)) {
          throw new FatalError('Both clientCredentials.clientId and clientCredentials.clientSecret must be supplied in bookingPartner config');
        }

        if (authenticationConfig.initialAccessToken) {
          try {
            this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.clientCredentials = await this.client.register(authenticationConfig.initialAccessToken);
            this.log(`Registered client for booking partner '${bookingPartnerIdentifier}'`);
          } catch (error) {
            this.log(`Error registered client for booking partner '${bookingPartnerIdentifier}'`);
            this.dynamicRegistrationFailure = true;
            throw error;
          }
        }

        try {
          const { clientId, clientSecret } = this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.clientCredentials;
          this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.orderFeedTokenSet = await this.client.authorizeClientCredentialsFlow(clientId, clientSecret);
          this.log(`Retrieved Orders Feed tokens via Client Credentials Flow for booking partner '${bookingPartnerIdentifier}'`);
        } catch (error) {
          this.log(`Error retrieving Orders Feed tokens via Client Credentials Flow for booking partner '${bookingPartnerIdentifier}'`);
          throw error;
        }
      }));

      // Authenticate sellers
      const sellers = Object.entries(this.sellersConfig).filter(([, s]) => s.authentication && s.authentication.loginCredentials);
      if (sellers.length === 0) {
        return;
      }

      await Promise.all(sellers.map(async ([sellerIdentifier, seller]) => {
        // Ensure structure of config is correct
        const authenticationConfig = seller.authentication;
        if (authenticationConfig.loginCredentials !== null && !(authenticationConfig.loginCredentials.username && authenticationConfig.loginCredentials.password)) {
          throw new FatalError('Both loginCredentials.username and loginCredentials.password must be supplied in seller config');
        }

        this.sellersConfig[sellerIdentifier].authentication.bookingPartnerTokenSets = {
        };

        await Promise.all(Object.entries(this.bookingPartnersConfig).map(async ([bookingPartnerIdentifier, bookingPartner]) => {
          // Ensure structure of config is correct
          const bookingPartnerAuthenticationConfig = bookingPartner.authentication;

          if (bookingPartnerAuthenticationConfig.clientCredentials) {
            try {
              const { clientId, clientSecret } = bookingPartnerAuthenticationConfig.clientCredentials;
              const { tokenSet } = await this.client.authorizeAuthorizationCodeFlow(clientId, clientSecret, {
                buttonSelector: '.btn-primary',
                headless: headlessAuth,
                username: authenticationConfig.loginCredentials.username,
                password: authenticationConfig.loginCredentials.password,
              });
              if (!tokenSet.refresh_token) {
                throw new Error('Refresh token is required, but not provided.');
              }
              this.log(`Retrieved access token via Authorization Code Flow for seller '${sellerIdentifier}' for booking partner '${bookingPartnerIdentifier}'`);
              this.sellersConfig[sellerIdentifier].authentication.bookingPartnerTokenSets[bookingPartnerIdentifier] = tokenSet;
            } catch (error) {
              this.log(`Error retrieving access token via Authorization Code Flow for seller '${sellerIdentifier}' for booking partner '${bookingPartnerIdentifier}'`);
              throw error;
            }
          }
        }));
      }));
    } catch (error) {
      this.authenticationFailure = true;
      throw error;
    }
  }

  async updateAccessTokens() {
    // Only run the update if initialise ran successfully
    if (!this.client.issuer) return;

    const sellers = Object.entries(this.sellersConfig).filter(([, s]) => s.authentication && s.authentication.bookingPartnerTokenSets);
    await Promise.all(sellers.map(async ([sellerIdentifier, seller]) => {
      await Promise.all(Object.entries(seller.authentication.bookingPartnerTokenSets).map(async ([bookingPartnerIdentifier, tokenSet]) => {
        // Do not refresh tokens that have at least 10 minutes remaining
        if (tokenSet.expires_in && tokenSet.expires_in > 10 * 60) {
          return;
        }
        const { clientId, clientSecret } = this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.clientCredentials;
        this.log(`Refreshed access token for seller '${sellerIdentifier}' for booking partner '${bookingPartnerIdentifier}'`);
        this.sellersConfig[sellerIdentifier].authentication.bookingPartnerTokenSets[bookingPartnerIdentifier] = await this.client.refresh(tokenSet.refresh_token, clientId, clientSecret);
      }));
    }));
  }
};