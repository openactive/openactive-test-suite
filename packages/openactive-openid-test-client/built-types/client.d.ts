export = OpenActiveOpenIdTestClient;
declare class OpenActiveOpenIdTestClient {
    constructor(baseUrl: any);
    baseUrl: any;
    callbackUrl: string;
    issuer: import("openid-client").Issuer<import("openid-client").Client>;
    /**
     * @param {string} authenticationAuthority
     */
    discover(authenticationAuthority: string): Promise<import("openid-client").Issuer<import("openid-client").Client>>;
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
     * @typedef {Object} AuthorizeOptions
     * @property {boolean} headless
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
    authorizeAuthorizationCodeFlow(clientId: string, clientSecret: string, options: {
        headless: boolean;
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
     */
    authorizeClientCredentialsFlow(clientId: string, clientSecret: string, issuer?: import("openid-client").Issuer<import("openid-client").Client>): Promise<{
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
