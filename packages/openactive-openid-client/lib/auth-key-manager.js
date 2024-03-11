const FatalError = require('./fatal-error');
const OpenActiveOpenIdTestClient = require('./client');

// TODO Get full types for sellersConfig and bookingPartnersConfig
/**
 * @typedef Config
 * @property {any} sellersConfig The augmented config for each seller. This starts with
 *   the config provided in the constructor, and is augmented with authentication info.
 *
 *   Augmented fields:
 *
 *   - `.[sellerIdentifier].authentication.bookingPartnerTokenSets.[bookingPartnerIdentifier]`:
 *     An openid-client [TokenSet](https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokenset),
 *     containing `access_token`, etc.
 * @property {any} bookingPartnersConfig The augmented config for each booking partner.
 *   This stats with the config provided in the constructor, and is augmented with
 *   authentication info.
 *
 *   Augmented fields:
 *
 *   - `.[bookingPartnerIdentifier].authentication.clientCredentials`: `{ clientId: string, clentSecret: string }`.
 *     This is created by AuthKeyManager when the booking partner uses Dynamic
 *     Client Registration.
 *   - `.[bookingPartnerIdentifier].authentication.orderFeedTokenSet`: An openid-client
 *     [TokenSet](https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokenset),
 *     containing `access_token`, etc.
 * @property {boolean} authenticationFailure True if any of the authentication in
 *   AuthKeyManager's `.initialise(..)` failed.
 * @property {boolean} dynamicRegistrationFailure True if any of the dynamic client
 *   registration in AuthKeyManager's `.initialise(..)` failed.
 */

/**
 * AuthKeyManager manages Orders Feed Authentication (per-booking partner) and
 * Booking Authentication (per-booking partner per-seller), using OAuth.
 * It holds onto the access tokens, and can refresh them when they expire.
 */
class OpenActiveTestAuthKeyManager {
  constructor(log, baseUrl, sellersConfig, bookingPartnerConfig) {
    this.log = log;
    // TODO: Improve deep copy
    this.sellersConfig = JSON.parse(JSON.stringify(sellersConfig));
    this.bookingPartnersConfig = JSON.parse(JSON.stringify(bookingPartnerConfig));
    this.client = new OpenActiveOpenIdTestClient(baseUrl);
    this.authenticationFailure = false;
    this.dynamicRegistrationFailure = false;
  }

  /**
   * Config which includes:
   *
   * - Access tokens for connecting to the booking system for each booking partner
   *   and seller.
   * - Whether any authentication or dynamic client registration failed.
   *
   * @returns {Config}
   */
  get config() {
    return {
      sellersConfig: this.sellersConfig,
      bookingPartnersConfig: this.bookingPartnersConfig,
      authenticationFailure: this.authenticationFailure,
      dynamicRegistrationFailure: this.dynamicRegistrationFailure,
    };
  }

  /**
   * Authenticate, using OAuth, every booking partner and seller that requires it.
   * This also acts as a validation step, ensuring that the config and OIDC implementation
   * are correct.
   *
   * - Validate live OpenID Provider configuration.
   * - A client will be registered for each booking partner that uses Dynamic
   *   Client Registration.
   * - For each booking partner, use client credentials to get access tokens
   *   (and therefore, validate the client credentials flow).
   * - For each seller that uses Authorization Code Flow, complete this flow
   *   using the endpoints provided by openactive-openid-browser-automation
   *   (and therefore, validate the authorization code flow).
   *
   * @param {string} authenticationAuthority The location of the OpenID Provider
   *   e.g. `https://auth.bookingsystem.com`. A `/.well-known/openid-configuration`
   *   (https://openid.net/specs/openid-connect-discovery-1_0.html) endpoint should
   *   exist at this base URL.
   * @param {boolean} headlessAuth Whether to use headless authentication for the browser part of Authorization Code Flow.
   *   If false, the browser window will be shown. Defaults to true
   */
  async initialise(authenticationAuthority, headlessAuth = true) {
    try {
      if (!authenticationAuthority) {
        throw new FatalError('authenticationAuthority must be provided');
      }

      // Authenticate booking partners
      const bookingPartners = Object.entries(this.bookingPartnersConfig ?? {
      }).filter(([, s]) => s?.authentication?.initialAccessToken || s?.authentication?.clientCredentials);
      if (bookingPartners.length === 0) {
        this.log('\n*** WARNING: Booking partner authentication configuration not found ***\n');
        return;
      }

      // Is dynamic registration enabled?
      const useDynamicRegistration = Object.entries(this.bookingPartnersConfig).some(([, s]) => s?.authentication?.initialAccessToken);

      this.log(`\nAuthenticating using OpenID Connect with issuer '${authenticationAuthority}' with dynamic registration ${useDynamicRegistration ? 'enabled' : 'disabled'}...`);

      // Check that valid OpenID coniguration exists at the authenticationAuthority
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

        // Resolve dynamic registration for the booking partner, if initialAccessToken provided
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
      }));

      // Get Client Credentials for Orders feed
      await this.refreshClientCredentialsAccessTokensIfNeeded();

      // Authenticate sellers that require Auth Code Flow
      const sellers = Object.entries(this.sellersConfig).filter(([, s]) => s?.authentication?.loginCredentials);
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

  /**
   * Tokens retrieved through the Client Credentials Flow expire, and so must be refreshed periodically using the client credentials
   */
  async refreshClientCredentialsAccessTokensIfNeeded() {
    // Only run the update if initialise ran successfully
    if (!this.client.issuer) return;

    // Refresh tokens for Booking Partners
    await Promise.all(Object.entries(this.bookingPartnersConfig).map(async ([bookingPartnerIdentifier, bookingPartner]) => {
      // Do not refresh tokens that have at least 1 minute remaining
      const { orderFeedTokenSet } = bookingPartner.authentication;
      if (orderFeedTokenSet?.expires_in && orderFeedTokenSet.expires_in > 60) {
        return;
      }

      try {
        const { clientId, clientSecret } = bookingPartner.authentication.clientCredentials;
        const { tokenSet } = await this.client.authorizeClientCredentialsFlow(clientId, clientSecret, this.client.issuer, false);
        this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.orderFeedTokenSet = tokenSet;
        this.log(`Retrieved Orders Feed tokens via Client Credentials Flow for booking partner '${bookingPartnerIdentifier}'`);
      } catch (error) {
        this.log(`Error retrieving Orders Feed tokens via Client Credentials Flow for booking partner '${bookingPartnerIdentifier}'`);
        throw error;
      }
    }));

    // Refresh Seller token if Client Credentials Auth Flow is used.
    // We only consider the primary seller as Client Credentials only supports 1 seller.
    if (this.sellersConfig.primary?.authentication?.clientCredentials) {
      // Since Booking System is a single seller system, add the tokenSet to the primary (and only) Seller
      const bookingPartnerTokenSets = this.sellersConfig.primary.authentication?.bookingPartnerTokenSets || {

      };

      // Do not refresh tokens that have at least 1 minute remaining
      if (bookingPartnerTokenSets.primary?.expires_in && bookingPartnerTokenSets.primary?.expires_in > 60) {
        return;
      }

      try {
        const { clientId, clientSecret } = this.sellersConfig.primary.authentication.clientCredentials;
        const { tokenSet } = await this.client.authorizeClientCredentialsFlow(clientId, clientSecret, this.client.issuer, true);
        this.sellersConfig.primary.authentication = {
          bookingPartnerTokenSets: {
            primary: tokenSet,
          },
        };
        this.log('Retrieved Booking tokens via Client Credentials Flow for seller');
      } catch (error) {
        this.log('Error retrieving Booking tokens via Client Credentials Flow for seller');
        throw error;
      }
    }
  }

  /**
   * Tokens retrieved through the Authorization Code Flow expire, and so must be refreshed periodically using a refresh token
   */
  async refreshAuthorizationCodeFlowAccessTokensIfNeeded() {
    // Only run the update if initialise ran successfully
    if (!this.client.issuer) return;

    const sellers = Object.entries(this.sellersConfig).filter(([, s]) => s?.authentication?.bookingPartnerTokenSets);
    await Promise.all(sellers.map(async ([sellerIdentifier, seller]) => {
      await Promise.all(Object.entries(seller.authentication.bookingPartnerTokenSets).map(async ([bookingPartnerIdentifier, tokenSet]) => {
        // Do not refresh tokens that have at least 10 minutes remaining
        if (tokenSet?.expires_in && tokenSet.expires_in > 10 * 60) {
          return;
        }
        const { clientId, clientSecret } = this.bookingPartnersConfig[bookingPartnerIdentifier].authentication.clientCredentials;
        this.sellersConfig[sellerIdentifier].authentication.bookingPartnerTokenSets[bookingPartnerIdentifier] = await this.client.refresh(tokenSet.refresh_token, clientId, clientSecret);
        this.log(`Refreshed access token for seller '${sellerIdentifier}' for booking partner '${bookingPartnerIdentifier}'`);
      }));
    }));
  }
}

module.exports = OpenActiveTestAuthKeyManager;
