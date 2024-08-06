export type AuthSessionContext = {
    send: (status: number, json: any) => void;
    screenshots: {
        title: string;
        url: string;
        image: string;
    }[];
    requiredConsent?: boolean;
};
export type ButtonSelectors = {
    username: string;
    password: string;
    button: string;
};
export type BrowserAutomationForAuthOptions = {
    /**
     * The URL to the OpenID Provider's
     * authorization (login) page.
     * This MUST include the necessary query params including the redirect_uri
     * set to the `/cb` endpoint.
     */
    authorizationUrl: string;
    headless?: boolean;
    username: string;
    password: string;
};
/**
 * @param {import('express').Application} expressApp
 * @param {ButtonSelectors} buttonSelectors
 */
export function setupBrowserAutomationRoutes(expressApp: import('express').Application, buttonSelectors: ButtonSelectors): void;
