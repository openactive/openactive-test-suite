export = OpenActiveTestAuthKeyManager;
declare class OpenActiveTestAuthKeyManager {
    constructor(log: any, baseUrl: any, sellersConfig: any, bookingPartnerConfig: any);
    log: any;
    sellersConfig: any;
    bookingPartnersConfig: any;
    client: OpenActiveOpenIdTestClient;
    authenticationFailure: boolean;
    dynamicRegistrationFailure: boolean;
    get config(): {
        sellersConfig: any;
        bookingPartnersConfig: any;
        authenticationFailure: boolean;
        dynamicRegistrationFailure: boolean;
    };
    initialise(authenticationAuthority: any, headlessAuth?: boolean): Promise<void>;
    /**
     * Tokens retrieved through the Client Credentials Flow expire, and so must be refreshed periodically using the client credentials
     */
    refreshClientCredentialsAccessTokensIfNeeded(): Promise<void>;
    /**
     * Tokens retrieved through the Authorization Code Flow expire, and so must be refreshed periodically using a refresh token
     */
    refreshAuthorizationCodeFlowAccessTokensIfNeeded(): Promise<void>;
}
import OpenActiveOpenIdTestClient = require("./client");
