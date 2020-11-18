export type Context = {
    send: (status: number, json: any) => void;
    screenshots: {
        title: string;
        url: string;
        image: string;
    }[];
    requiredConsent?: boolean;
};
/**
 * @param {import('express').Application} app
 * @param {string} buttonSelector
 */
export function setupBrowserAutomationRoutes(app: import('express').Application, buttonSelector: string): void;
