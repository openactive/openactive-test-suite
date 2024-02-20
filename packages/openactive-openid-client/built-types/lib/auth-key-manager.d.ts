export = OpenActiveTestAuthKeyManager;
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
declare class OpenActiveTestAuthKeyManager {
    constructor(log: any, baseUrl: any, sellersConfig: any, bookingPartnerConfig: any);
    log: any;
    sellersConfig: any;
    bookingPartnersConfig: any;
    client: OpenActiveOpenIdTestClient;
    authenticationFailure: boolean;
    dynamicRegistrationFailure: boolean;
    /**
     * Config which includes:
     *
     * - Access tokens for connecting to the booking system for each booking partner
     *   and seller.
     * - Whether any authentication or dynamic client registration failed.
     *
     * @returns {Config}
     */
    get config(): Config;
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
    initialise(authenticationAuthority: string, headlessAuth?: boolean): Promise<void>;
    /**
     * Tokens retrieved through the Client Credentials Flow expire, and so must be refreshed periodically using the client credentials
     */
    refreshClientCredentialsAccessTokensIfNeeded(): Promise<void>;
    /**
     * Tokens retrieved through the Authorization Code Flow expire, and so must be refreshed periodically using a refresh token
     */
    refreshAuthorizationCodeFlowAccessTokensIfNeeded(): Promise<void>;
}
declare namespace OpenActiveTestAuthKeyManager {
    export { Config };
}
import OpenActiveOpenIdTestClient = require("./client");
type Config = {
    /**
     * The augmented config for each seller. This starts with
     * the config provided in the constructor, and is augmented with authentication info.
     *
     * Augmented fields:
     *
     * - `.[sellerIdentifier].authentication.bookingPartnerTokenSets.[bookingPartnerIdentifier]`:
     * An openid-client [TokenSet](https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokenset),
     * containing `access_token`, etc.
     */
    sellersConfig: any;
    /**
     * The augmented config for each booking partner.
     * This stats with the config provided in the constructor, and is augmented with
     * authentication info.
     *
     * Augmented fields:
     *
     * - `.[bookingPartnerIdentifier].authentication.clientCredentials`: `{ clientId: string, clentSecret: string }`.
     * This is created by AuthKeyManager when the booking partner uses Dynamic
     * Client Registration.
     * - `.[bookingPartnerIdentifier].authentication.orderFeedTokenSet`: An openid-client
     * [TokenSet](https://github.com/panva/node-openid-client/blob/main/docs/README.md#tokenset),
     * containing `access_token`, etc.
     */
    bookingPartnersConfig: any;
    /**
     * True if any of the authentication in
     * AuthKeyManager's `.initialise(..)` failed.
     */
    authenticationFailure: boolean;
    /**
     * True if any of the dynamic client
     * registration in AuthKeyManager's `.initialise(..)` failed.
     */
    dynamicRegistrationFailure: boolean;
};
