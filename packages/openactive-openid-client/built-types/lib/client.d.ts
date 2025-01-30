export = OpenActiveOpenIdTestClient;
declare class OpenActiveOpenIdTestClient {
    constructor(baseUrl: any);
    baseUrl: any;
    callbackUrl: string;
    issuer: Issuer<import("openid-client").Client>;
    /**
     * @param {string} authenticationAuthority
     */
    discover(authenticationAuthority: string): Promise<Issuer<import("openid-client").Client>>;
    /**
     * @param {string} initialAccessToken
     * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
     */
    register(initialAccessToken: string, issuer?: import("openid-client").Issuer<import("openid-client").Client>): Promise<{
        clientId: any;
        clientSecret: any;
        registration: any;
    }>;
    /**
     * @typedef {object} AuthorizeOptions
     * @property {boolean} headless
     * @property {boolean} [offlineAccess]
     * @property {string} username
     * @property {string} password
     */
    /**
     * PRE-REQUISITE: Browser Automation Routes should have been setup. This method
     * uses them. See the `openactive-openid-browser-automation` package for more
     * info.
     *
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {AuthorizeOptions} options
     * @param {import('openid-client').AuthorizationParameters} authorizationParameters
     * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
     */
    authorizeAuthorizationCodeFlow(clientId: string, clientSecret: string, options: {
        headless: boolean;
        offlineAccess?: boolean;
        username: string;
        password: string;
    }, authorizationParameters?: import('openid-client').AuthorizationParameters, issuer?: import("openid-client").Issuer<import("openid-client").Client>): Promise<{
        authorizationUrl: string;
        tokenSet: import("openid-client").TokenSet;
        requiredConsent: any;
    }>;
    /**
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
     * @param {boolean} includeOpenActiveBookingScope this param should only be true if the booking system is a Single Seller system
     * and Client Credentials is used to authorize the Booking Partners with the seller.
     */
    authorizeClientCredentialsFlow(clientId: string, clientSecret: string, issuer?: import("openid-client").Issuer<import("openid-client").Client>, includeOpenActiveBookingScope?: boolean): Promise<{
        tokenSet: import("openid-client").TokenSet;
    }>;
    /**
     * @param {string} refreshToken
     * @param {string} clientId
     * @param {string} clientSecret
     * @param {import("openid-client").Issuer<import("openid-client").Client>} issuer
     */
    refresh(refreshToken: string, clientId: string, clientSecret: string, issuer?: import("openid-client").Issuer<import("openid-client").Client>): Promise<import("openid-client").TokenSet>;
}
import { Issuer } from "openid-client";
