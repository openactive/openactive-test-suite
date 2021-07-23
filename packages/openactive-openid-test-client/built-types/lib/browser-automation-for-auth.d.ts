export type Context = {
    send: (status: number, json: any) => void;
    screenshots: {
        title: string;
        url: string;
        image: string;
    }[];
    requiredConsent?: boolean;
};
export type ButtonSelectors = {
    selectIdentityProviderButton: string;
    username: string;
    password: string;
    button: string;
};
/**
 * @param {import('express').Application} app
 * @param {ButtonSelectors} buttonSelectors
 */
export function setupBrowserAutomationRoutes(app: import('express').Application, buttonSelectors: ButtonSelectors): void;
